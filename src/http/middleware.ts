import { NextFunction, Request, RequestHandler, Response } from 'express';
import controlAcces from 'express-ip-access-control';
import { IpFilter as ipfilter } from 'express-ipfilter';
import { z } from 'zod';
import * as adaptateurEnvironnementParDefaut from '../adaptateurs/adaptateurEnvironnement.js';
import { CSP_BIBLIOTHEQUES } from '../routes/nonConnecte/routesNonConnecteApiBibliotheques.js';
import {
  Droits,
  DroitsAvecEstProprietaire,
  Permissions,
  verifieCoherenceDesDroits,
} from '../modeles/autorisations/gestionDroits.js';
import {
  ErreurChainageMiddleware,
  ErreurDroitsIncoherents,
} from '../erreurs.js';
import { ajouteLaRedirectionPostConnexion } from './redirection.js';
import { extraisIp } from './requeteHttp.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';
import { TYPES_REQUETES } from './configurationServeur.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurHorloge } from '../adaptateurs/adaptateurHorloge.js';
import { AdaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.interface.js';
import { AdaptateurJWT } from '../adaptateurs/adaptateurJWT.interface.js';
import { AdaptateurProtection } from '../adaptateurs/adaptateurProtection.interface.js';
import { AdaptateurGestionErreur } from '../adaptateurs/adaptateurGestionErreur.interface.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import Dossier from '../modeles/dossier.js';
import Utilisateur from '../modeles/utilisateur.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';

const { LECTURE, INVISIBLE } = Permissions;

type ConfigurationMiddleware = {
  adaptateurHorloge: AdaptateurHorloge;
  adaptateurEnvironnement: AdaptateurEnvironnement;
  adaptateurJWT: AdaptateurJWT;
  adaptateurProtection: AdaptateurProtection;
  adaptateurGestionErreur: AdaptateurGestionErreur;
  adaptateurChiffrement: AdaptateurChiffrement;
  depotDonnees: DepotDonnees;
};

export type TypeRequete = 'API' | 'NAVIGATION' | 'RESSOURCE';

export type RequeteMSS = Request & {
  autorisationService?: Autorisation;
  cguAcceptees?: boolean;
  dossierCourant?: Dossier;
  estInvite?: boolean;
  idUtilisateurCourant?: UUID;
  service?: Service;
  sourceAuthentification?: SourceAuthentification;
  typeRequete?: TypeRequete;
};

const middleware = (configuration: ConfigurationMiddleware) => {
  const {
    depotDonnees,
    adaptateurEnvironnement = adaptateurEnvironnementParDefaut,
    adaptateurHorloge,
    adaptateurJWT,
    adaptateurProtection,
    adaptateurGestionErreur,
    adaptateurChiffrement,
  } = configuration;

  const positionneHeaders: RequestHandler = (_requete, reponse, suite) => {
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

  const suppressionCookie: RequestHandler = (requete, _reponse, suite) => {
    requete.session = null;
    suite();
  };

  const verificationJWT = async (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    const renvoieUtilisateurSansJWTValide = () => {
      if (requete.typeRequete === TYPES_REQUETES.API) {
        return reponse.status(401).send({ cause: 'TOKEN_EXPIRE' });
      }
      const urlDemandee = requete.originalUrl;
      const urlAvecRedirection = ajouteLaRedirectionPostConnexion(urlDemandee);
      return reponse.redirect(urlAvecRedirection);
    };

    try {
      const token = adaptateurJWT.decode(requete.session?.token);

      const utilisateur = await depotDonnees.utilisateur(token.idUtilisateur);
      if (!utilisateur) return renvoieUtilisateurSansJWTValide();

      adaptateurGestionErreur.identifieUtilisateur(
        token.idUtilisateur,
        token.iat
      );

      requete.idUtilisateurCourant = token.idUtilisateur;
      requete.cguAcceptees = requete.session?.cguAcceptees;
      requete.estInvite = requete.session?.estInvite;
      requete.sourceAuthentification = token.source;
    } catch {
      return renvoieUtilisateurSansJWTValide();
    }
    return suite();
  };

  // On ajoute le générique <P> permettant de remplir les `params` de la requête
  // Cela aide Typescript pour comprendre qu'une route avec `/:id` a un `requete.params.id`
  const verificationAcceptationCGU = async <P = { [key: string]: string }>(
    requete: RequeteMSS & Request<P>,
    reponse: Response,
    suite: NextFunction
  ) => {
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

  // On ajoute le générique <P> permettant de remplir les `params` de la requête
  // Cela aide Typescript pour comprendre qu'une route avec `/:id` a un `requete.params.id`
  const trouveService =
    (droitsRequis: Partial<Droits>) =>
    async <P = { [key: string]: string }>(
      requete: RequeteMSS & Request<P>,
      reponse: Response,
      suite: NextFunction
    ) => {
      const resultat = z
        .looseObject({ id: z.uuid() })
        .safeParse(requete.params);
      if (!resultat.success) reponse.sendStatus(400);

      const idService = requete.params.id;

      const droitsCoherents = verifieCoherenceDesDroits(
        droitsRequis as DroitsAvecEstProprietaire
      );

      if (!droitsCoherents)
        throw new ErreurDroitsIncoherents(
          "L'objet de droits doit être de la forme `{ [Rubrique]: niveau }`"
        );

      await verificationAcceptationCGU(requete, reponse, async () => {
        try {
          const service = await depotDonnees.service(idService);
          const idUtilisateur = requete.idUtilisateurCourant;

          if (!service) reponse.status(404).send('Service non trouvé');
          else {
            const accesAutorise = await depotDonnees.accesAutorise(
              idUtilisateur,
              idService,
              droitsRequis
            );
            if (!accesAutorise) reponse.status(403).render('erreurAccesRefuse');
            else {
              requete.service = service;
              suite();
            }
          }
        } catch {
          reponse.status(422).send("Le service n'a pas pu être récupéré");
        }
      });
    };

  const trouveDossierCourant = (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
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

  const chargeEtatVisiteGuidee = async (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const parcoursUtilisateur = await depotDonnees.lisParcoursUtilisateur(
      requete.idUtilisateurCourant
    );
    const utilisateur = (await depotDonnees.utilisateur(
      requete.idUtilisateurCourant
    )) as Utilisateur;

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
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const parcoursUtilisateur = await depotDonnees.lisParcoursUtilisateur(
      requete.idUtilisateurCourant
    );

    reponse.locals.afficheExplicationNouveauReferentiel =
      parcoursUtilisateur.doitAfficherExplicationNouveauReferentiel();

    suite();
  };

  const chargeExplicationFinCompteLegacy = async (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const parcoursUtilisateur = await depotDonnees.lisParcoursUtilisateur(
      requete.idUtilisateurCourant
    );

    reponse.locals.afficheExplicationFinCompteLegacy =
      !parcoursUtilisateur.aVuTableauDeBord() &&
      requete.session?.sourceAuthentification === SourceAuthentification.MSS;

    suite();
  };

  const chargeExplicationUtilisationMFA = async (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const parcoursUtilisateur = await depotDonnees.lisParcoursUtilisateur(
      requete.idUtilisateurCourant
    );

    let doitAfficher = false;
    if (
      requete.session?.sourceAuthentification ===
      SourceAuthentification.AGENT_CONNECT
    ) {
      doitAfficher =
        !parcoursUtilisateur.aVuTableauDeBord() &&
        !requete.session.connexionAvecMFA;
    }
    reponse.locals.afficheExplicationUtilisationMFA = doitAfficher;

    suite();
  };

  const chargeEtatAgentConnect: RequestHandler = async (
    _requete,
    reponse,
    suite
  ) => {
    reponse.locals.agentConnectActif = adaptateurEnvironnement
      .featureFlag()
      .avecAgentConnect();

    suite();
  };

  const chargePreferencesUtilisateur: RequestHandler = (
    requete,
    reponse,
    suite
  ) => {
    reponse.locals.preferencesUtilisateur = {
      etatMenuNavigation: requete.cookies['etat-menu-navigation'],
    };
    suite();
  };

  const chargeAutorisationsService = (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    if (!requete.idUtilisateurCourant || !requete.service)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant et un service doivent être présent dans la requête. Manque-t-il un appel à `verificationJWT` et `trouveService` ?'
      );

    depotDonnees
      .autorisationPour(requete.idUtilisateurCourant, requete.service.id)
      .then((autorisation: Autorisation) => {
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

  const verificationAddresseIP = (listeAddressesIPsAutorisee: string[]) =>
    controlAcces({
      mode: 'allow',
      allows: listeAddressesIPsAutorisee,
      forceConnectionAddress: false,
      log: false,
      statusCode: '401',
      message: 'Non autorisé',
    });

  const challengeMotDePasse = (
    requete: RequeteMSS,
    reponse: Response,
    suite: NextFunction
  ) => {
    if (!requete.idUtilisateurCourant)
      throw new ErreurChainageMiddleware(
        'Un utilisateur courant doit être présent dans la requête. Manque-t-il un appel à `verificationJWT` ?'
      );

    const resultat = z
      .looseObject({ motDePasseChallenge: z.string().min(1) })
      .safeParse(requete.body);

    if (!resultat.success) reponse.sendStatus(400);

    const { motDePasseChallenge } = requete.body;

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
      const aucunFiltrage: RequestHandler = (_req, _rep, suite) => suite();
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

  const ajouteVersionFichierCompiles: RequestHandler = (
    _requete,
    reponse,
    suite
  ) => {
    reponse.locals.version = adaptateurEnvironnement.versionDeBuild();
    suite();
  };

  const verificationModeMaintenance: RequestHandler = (
    _requete,
    reponse,
    suite
  ) => {
    const modeMaintenance = adaptateurEnvironnement.modeMaintenance();
    const modeMaintenanceEnPreparation = modeMaintenance.enPreparation();
    const modeMaintenanceDetailsPreparation =
      modeMaintenance.detailsPreparation();
    if (modeMaintenanceEnPreparation && modeMaintenanceDetailsPreparation) {
      const [jour, heure] = modeMaintenanceDetailsPreparation.split(' - ');
      reponse.locals.avertissementMaintenance = { jour, heure };
    }
    const modeMaintenanceActif = modeMaintenance.actif();
    if (modeMaintenanceActif) {
      reponse.status(503).render('maintenance');
    } else {
      suite();
    }
  };

  const redirigeVersUrlBase: RequestHandler = (requete, reponse, suite) => {
    if (
      requete.headers.host ===
      new URL(adaptateurEnvironnement.mss().urlBase()!).host
    ) {
      suite();
      return;
    }
    reponse.redirect(
      `${adaptateurEnvironnement.mss().urlBase()}${requete.originalUrl}`
    );
  };

  const chargeTypeRequete =
    (typeRequete: TypeRequete) =>
    (requete: RequeteMSS, _reponse: Response, suite: NextFunction) => {
      requete.typeRequete = typeRequete;
      suite();
    };

  const interdisLaMiseEnCache: RequestHandler = (_requete, reponse, suite) => {
    reponse.set({
      'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      pragma: 'no-cache',
      expires: '0',
      'surrogate-control': 'no-store',
    });
    suite();
  };

  const chargeFeatureFlags: RequestHandler = (_requete, reponse, suite) => {
    reponse.locals.featureFlags = {
      avecBandeauMSC:
        adaptateurHorloge.maintenant() >
        new Date(
          adaptateurEnvironnement.featureFlag().dateDebutBandeauMSC() || 0
        ),
      avecDecrireV2: adaptateurEnvironnement.featureFlag().avecDecrireV2(),
    };
    suite();
  };

  return {
    ajouteVersionFichierCompiles,
    challengeMotDePasse,
    chargeAutorisationsService,
    chargeEtatAgentConnect,
    chargeEtatVisiteGuidee,
    chargeExplicationFinCompteLegacy,
    chargeExplicationNouveauReferentiel,
    chargeExplicationUtilisationMFA,
    chargeFeatureFlags,
    chargePreferencesUtilisateur,
    chargeTypeRequete,
    filtreIpAutorisees,
    interdisLaMiseEnCache,
    positionneHeaders,
    protegeTrafic,
    redirigeVersUrlBase,
    suppressionCookie,
    trouveDossierCourant,
    trouveService,
    verificationAcceptationCGU,
    verificationAddresseIP,
    verificationJWT,
    verificationModeMaintenance,
  };
};

export default middleware;
