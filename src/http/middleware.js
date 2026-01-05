import controlAcces from 'express-ip-access-control';
import { check } from 'express-validator';
import { IpFilter as ipfilter } from 'express-ipfilter';
import * as adaptateurEnvironnementParDefaut from '../adaptateurs/adaptateurEnvironnement.js';
import { CSP_BIBLIOTHEQUES } from '../routes/nonConnecte/routesNonConnecteApiBibliotheques.js';
import {
  verifieCoherenceDesDroits,
  Permissions,
} from '../modeles/autorisations/gestionDroits.js';
import {
  ErreurDroitsIncoherents,
  ErreurChainageMiddleware,
} from '../erreurs.js';
import { ajouteLaRedirectionPostConnexion } from './redirection.js';
import { extraisIp } from './requeteHttp.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';
import { TYPES_REQUETES } from './configurationServeur.js';

const { LECTURE, INVISIBLE } = Permissions;

const middleware = (configuration = {}) => {
  const {
    depotDonnees,
    adaptateurEnvironnement = adaptateurEnvironnementParDefaut,
    adaptateurHorloge,
    adaptateurJWT,
    adaptateurProtection,
    adaptateurGestionErreur,
    adaptateurChiffrement,
  } = configuration;

  const positionneHeaders = (_requete, reponse, suite) => {
    const nonce = adaptateurChiffrement.nonce();
    reponse.locals.nonce = nonce;

    const defaultCsp = "default-src 'self'";
    const connectCsp = `connect-src 'self' https://sentry.incubateur.net ${CSP_BIBLIOTHEQUES.matomo.connect} ${CSP_BIBLIOTHEQUES.viteHotReload}`;
    const imgCsp = `img-src 'self' ${CSP_BIBLIOTHEQUES.crisp.image} ${CSP_BIBLIOTHEQUES['lab-anssi-ui-kit'].img}`;
    const mediaCsp = `media-src 'self' ${CSP_BIBLIOTHEQUES.monservicesecurise.media}`;

    const styleCsp = `style-src 'self' 'nonce-${nonce}'`;
    const styleSrcElemCsp = `style-src-elem 'self' 'nonce-${nonce}'`;
    const scriptCsp = `script-src 'self' https://browser.sentry-cdn.com 'nonce-${nonce}'`;
    const frameCsp = adaptateurEnvironnement.supervision().domaineMetabaseMSS()
      ? `frame-src ${adaptateurEnvironnement
          .supervision()
          .domaineMetabaseMSS()}`
      : '';

    const toutesCsp = [
      defaultCsp,
      connectCsp,
      imgCsp,
      mediaCsp,
      styleCsp,
      styleSrcElemCsp,
      scriptCsp,
      frameCsp,
    ].filter((csp) => csp !== '');

    reponse.set({
      'content-security-policy': `${toutesCsp.join('; ')}`,
      'x-frame-options': 'deny',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-resource-policy': 'same-origin',
    });

    suite();
  };

  const suppressionCookie = (requete, _reponse, suite) => {
    requete.session = null;
    suite();
  };

  const verificationJWT = async (requete, reponse, suite) => {
    const renvoieUtilisateurSansJWTValide = () => {
      if (requete.typeRequete === TYPES_REQUETES.API) {
        return reponse.status(401).send({ cause: 'TOKEN_EXPIRE' });
      }
      const urlDemandee = requete.originalUrl;
      const urlAvecRedirection = ajouteLaRedirectionPostConnexion(urlDemandee);
      return reponse.redirect(urlAvecRedirection);
    };

    try {
      const token = adaptateurJWT.decode(requete.session.token);

      const utilisateur = await depotDonnees.utilisateur(token.idUtilisateur);
      if (!utilisateur) return renvoieUtilisateurSansJWTValide();

      adaptateurGestionErreur.identifieUtilisateur(
        token.idUtilisateur,
        token.iat
      );

      requete.idUtilisateurCourant = token.idUtilisateur;
      requete.cguAcceptees = requete.session.cguAcceptees;
      requete.estInvite = requete.session.estInvite;
      requete.sourceAuthentification = token.source;

      requete.session.token = utilisateur.genereToken(token.source);
    } catch (e) {
      return renvoieUtilisateurSansJWTValide();
    }
    return suite();
  };

  const verificationAcceptationCGU = async (requete, reponse, suite) => {
    await verificationJWT(requete, reponse, () => {
      if (requete.estInvite) {
        return reponse.redirect(
          requete.sourceAuthentification === SourceAuthentification.MSS
            ? '/connexion'
            : '/oidc/connexion'
        );
      }

      if (!requete.cguAcceptees) {
        return reponse.redirect('/cgu');
      }
      return suite();
    });
  };

  const trouveService = (droitsRequis) => async (requete, reponse, suite) => {
    const idService = requete.params.id;

    const droitsCoherents = verifieCoherenceDesDroits(droitsRequis);

    if (!droitsCoherents)
      throw new ErreurDroitsIncoherents(
        "L'objet de droits doit être de la forme `{ [Rubrique]: niveau }`"
      );

    await verificationAcceptationCGU(requete, reponse, () =>
      depotDonnees
        .service(idService)
        .then((service) => {
          const idUtilisateur = requete.idUtilisateurCourant;

          if (!service) reponse.status(404).send('Service non trouvé');
          else {
            depotDonnees
              .accesAutorise(idUtilisateur, idService, droitsRequis)
              .then((accesAutorise) => {
                if (!accesAutorise)
                  reponse.status(403).render('erreurAccesRefuse');
                else {
                  requete.service = service;
                  suite();
                }
              });
          }
        })
        .catch(() =>
          reponse.status(422).send("Le service n'a pas pu être récupéré")
        )
    );
  };

  const trouveDossierCourant = (requete, reponse, suite) => {
    if (!requete.service)
      throw new ErreurChainageMiddleware(
        'Un service doit être présent dans la requête. Manque-t-il un appel à `trouveService` ?'
      );

    const dossierCourant = requete.service.dossierCourant();
    if (!dossierCourant) {
      reponse.status(404).send('Service sans dossier courant');
    } else {
      requete.dossierCourant = dossierCourant;
      suite();
    }
  };

  const aseptise =
    (...nomsParametres) =>
    (requete, _reponse, suite) => {
      const paramsTableauxVides = Object.keys(requete.body).filter(
        (p) => Array.isArray(requete.body[p]) && requete.body[p].length === 0
      );

      const aseptisations = nomsParametres.map((p) =>
        check(p).trim().run(requete)
      );

      return Promise.all(aseptisations)
        .then(() => paramsTableauxVides.forEach((p) => (requete.body[p] = [])))
        .then(() => suite())
        .catch(suite);
    };

  const aseptiseListes = (listes) => (requete, reponse, suite) => {
    const nonTableau = listes
      .filter(({ nom }) => !Array.isArray(requete.body[nom]))
      .map((p) => p.nom);

    if (nonTableau.length > 0) {
      reponse
        .status(400)
        .send(`[${nonTableau.join(', ')}] devrait être un tableau`);
      return () => {};
    }

    listes.forEach(({ nom, proprietes }) => {
      requete.body[nom] &&= requete.body[nom].filter((element) =>
        proprietes.some((propriete) => element && element[propriete])
      );
    });
    const proprietesAAseptiser = listes.flatMap(({ nom, proprietes }) =>
      proprietes.map((propriete) => `${nom}.*.${propriete}`)
    );
    return aseptise(proprietesAAseptiser)(requete, reponse, suite);
  };

  const aseptiseListe = (nomListe, proprietesParametre) =>
    aseptiseListes([{ nom: nomListe, proprietes: proprietesParametre }]);

  const chargeEtatVisiteGuidee = async (requete, reponse, suite) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const parcoursUtilisateur = await depotDonnees.lisParcoursUtilisateur(
      requete.idUtilisateurCourant
    );
    const utilisateur = await depotDonnees.utilisateur(
      requete.idUtilisateurCourant
    );

    reponse.locals.etatVisiteGuidee = {
      ...parcoursUtilisateur.etatVisiteGuidee.toJSON(),
      utilisateurCourant: {
        prenom: utilisateur.prenom,
        profilComplet: utilisateur.completudeProfil().estComplet,
        dateInscription: utilisateur.dateCreation,
      },
      nombreEtapesRestantes:
        parcoursUtilisateur.etatVisiteGuidee.nombreEtapesRestantes(),
    };

    suite();
  };

  const chargeExplicationNouveauReferentiel = async (
    requete,
    reponse,
    suite
  ) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const parcoursUtilisateur = await depotDonnees.lisParcoursUtilisateur(
      requete.idUtilisateurCourant
    );

    reponse.locals.afficheExplicationNouveauReferentiel =
      adaptateurEnvironnement.featureFlag().avecDecrireV2() &&
      parcoursUtilisateur.doitAfficherExplicationNouveauReferentiel();

    suite();
  };

  const chargeExplicationFinCompteLegacy = async (requete, reponse, suite) => {
    reponse.locals.afficheExplicationFinCompteLegacy =
      requete.session?.sourceAuthentification === SourceAuthentification.MSS;

    suite();
  };

  const chargeEtatAgentConnect = async (_requete, reponse, suite) => {
    reponse.locals.agentConnectActif = adaptateurEnvironnement
      .featureFlag()
      .avecAgentConnect();

    suite();
  };

  const chargePreferencesUtilisateur = (requete, reponse, suite) => {
    reponse.locals.preferencesUtilisateur = {
      etatMenuNavigation: requete.cookies['etat-menu-navigation'],
    };
    suite();
  };

  const chargeAutorisationsService = (requete, reponse, suite) => {
    if (!requete.idUtilisateurCourant || !requete.service)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant et un service doivent être présent dans la requête. Manque-t-il un appel à `verificationJWT` et `trouveService` ?'
      );
    depotDonnees
      .autorisationPour(requete.idUtilisateurCourant, requete.service.id)
      .then((autorisation) => {
        const droitsRubriques = Object.entries(autorisation.droits).reduce(
          (droits, [rubrique, niveau]) => ({
            ...droits,
            [rubrique]: {
              estLectureSeule: niveau === LECTURE,
              estMasque: niveau === INVISIBLE,
            },
          }),
          {}
        );

        reponse.locals.autorisationsService = {
          ...droitsRubriques,
          peutHomologuer: autorisation.peutHomologuer(),
        };

        requete.autorisationService = autorisation;

        suite();
      });
  };

  const verificationAddresseIP = (listeAddressesIPsAutorisee) =>
    controlAcces({
      mode: 'allow',
      allows: listeAddressesIPsAutorisee,
      forceConnectionAddress: false,
      log: false,
      statusCode: 401,
      message: 'Non autorisé',
    });

  const challengeMotDePasse = (requete, reponse, suite) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const { motDePasseChallenge } = requete.body;
    if (!motDePasseChallenge) {
      reponse
        .status(422)
        .send('Le champ `motDePasseChallenge` est obligatoire');
      return;
    }

    depotDonnees
      .verifieMotDePasse(requete.idUtilisateurCourant, motDePasseChallenge)
      .then(() => suite())
      .catch(() => reponse.status(401).send('Mot de passe incorrect'));
  };

  const protegeTrafic = () =>
    adaptateurProtection.protectionLimiteTraficEndpointSensible();

  const filtreIpAutorisees = () => {
    const config = adaptateurEnvironnement.filtrageIp();

    if (!config.activerFiltrageIp()) {
      const aucunFiltrage = (_req, _rep, suite) => suite();
      return aucunFiltrage;
    }

    return ipfilter(config.ipAutorisees(), {
      // Seules les IP du WAF doivent être autorisées si jamais le filtrage IP est activé.
      detectIp: (requete) => extraisIp(requete.headers).waf,
      excluding: ['/api/sante'],
      mode: 'allow',
      log: false,
    });
  };

  const ajouteVersionFichierCompiles = (_requete, reponse, suite) => {
    reponse.locals.version = adaptateurEnvironnement.versionDeBuild();
    suite();
  };

  const verificationModeMaintenance = (_requete, reponse, suite) => {
    const modeMaintenance = adaptateurEnvironnement.modeMaintenance();
    const modeMaintenanceEnPreparation = modeMaintenance.enPreparation();
    if (modeMaintenanceEnPreparation) {
      const [jour, heure] = modeMaintenance.detailsPreparation().split(' - ');
      reponse.locals.avertissementMaintenance = { jour, heure };
    }
    const modeMaintenanceActif = modeMaintenance.actif();
    if (modeMaintenanceActif) {
      reponse.status(503).render('maintenance');
    } else {
      suite();
    }
  };

  const redirigeVersUrlBase = (requete, reponse, suite) => {
    if (
      requete.headers.host ===
      new URL(adaptateurEnvironnement.mss().urlBase()).host
    ) {
      suite();
      return;
    }
    reponse.redirect(
      `${adaptateurEnvironnement.mss().urlBase()}${requete.originalUrl}`
    );
  };

  const chargeTypeRequete = (typeRequete) => (requete, _reponse, suite) => {
    requete.typeRequete = typeRequete;
    suite();
  };

  const interdisLaMiseEnCache = (_requete, reponse, suite) => {
    reponse.set({
      'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      pragma: 'no-cache',
      expires: '0',
      'surrogate-control': 'no-store',
    });
    suite();
  };

  const chargeFeatureFlags = (_requete, reponse, suite) => {
    reponse.locals.featureFlags = {
      avecBandeauMSC:
        adaptateurHorloge.maintenant() >
        new Date(adaptateurEnvironnement.featureFlag().dateDebutBandeauMSC()),
      avecDecrireV2: adaptateurEnvironnement.featureFlag().avecDecrireV2(),
    };
    suite();
  };

  return {
    ajouteVersionFichierCompiles,
    aseptise,
    aseptiseListe,
    aseptiseListes,
    chargeAutorisationsService,
    chargeEtatAgentConnect,
    chargeEtatVisiteGuidee,
    chargeExplicationFinCompteLegacy,
    chargeExplicationNouveauReferentiel,
    chargeFeatureFlags,
    chargePreferencesUtilisateur,
    chargeTypeRequete,
    interdisLaMiseEnCache,
    positionneHeaders,
    protegeTrafic,
    filtreIpAutorisees,
    suppressionCookie,
    trouveService,
    trouveDossierCourant,
    verificationAcceptationCGU,
    verificationAddresseIP,
    verificationJWT,
    redirigeVersUrlBase,
    verificationModeMaintenance,
    challengeMotDePasse,
  };
};

export default middleware;
