const uuid = require('uuid');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const { decode } = require('html-entities');
const {
  CACHE_CONTROL_FICHIERS_STATIQUES,
  DUREE_SESSION,
  ENDPOINTS_SANS_CSRF,
} = require('./http/configurationServeur');
const routesConnecteApi = require('./routes/connecte/routesConnecteApi');
const routesService = require('./routes/connecte/routesService');
const routesApiPublique = require('./routes/nonConnecte/routesApiPublique');
const {
  routesBibliotheques,
} = require('./routes/nonConnecte/routesBibliotheques');
const routesStyles = require('./routes/nonConnecte/routesStyles');
const {
  estUrlLegalePourRedirection,
  construisUrlAbsolueVersPage,
} = require('./http/redirection');
const InformationsHomologation = require('./modeles/informationsHomologation');
const Service = require('./modeles/service');
const Utilisateur = require('./modeles/utilisateur');

require('dotenv').config();

const creeServeur = (
  depotDonnees,
  middleware,
  referentiel,
  moteurRegles,
  adaptateurMail,
  adaptateurPdf,
  adaptateurHorloge,
  adaptateurGestionErreur,
  serviceAnnuaire,
  adaptateurCsv,
  adaptateurZip,
  adaptateurTracking,
  adaptateurProtection,
  adaptateurJournalMSS,
  procedures,
  avecCookieSecurise = process.env.NODE_ENV === 'production',
  avecPageErreur = process.env.NODE_ENV === 'production'
) => {
  let serveur;

  const app = express();

  adaptateurGestionErreur.initialise(app);

  app.use(middleware.filtreIpAutorisees());

  app.use(express.json());

  app.use(
    cookieSession({
      maxAge: DUREE_SESSION,
      name: 'token',
      sameSite: true,
      secret: process.env.SECRET_COOKIE,
      secure: avecCookieSecurise,
    })
  );

  app.use(cookieParser());

  app.use(adaptateurProtection.protectionCsrf(ENDPOINTS_SANS_CSRF));
  app.use(adaptateurProtection.protectionLimiteTrafic());

  app.use(middleware.positionneHeaders);
  app.use(middleware.repousseExpirationCookie);

  app.disable('x-powered-by');

  app.set('trust proxy', 1);
  app.set('view engine', 'pug');
  app.set('views', './src/vues');

  app.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  app.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  app.get('/securite', (_requete, reponse) => {
    reponse.render('securite');
  });

  app.get('/accessibilite', (_requete, reponse) => {
    reponse.render('accessibilite');
  });

  app.get('/cgu', (_requete, reponse) => {
    reponse.render('cgu');
  });

  app.get('/confidentialite', (_requete, reponse) => {
    reponse.render('confidentialite');
  });

  app.get('/connexion', middleware.suppressionCookie, (requete, reponse) => {
    const { urlRedirection } = requete.query;

    if (!urlRedirection) {
      reponse.render('connexion');
      return;
    }

    if (!estUrlLegalePourRedirection(urlRedirection)) {
      // Ici c'est un redirect, pour nettoyer l'URL de la redirection invalide.
      reponse.redirect('connexion');
      return;
    }

    reponse.render('connexion', {
      urlRedirection: construisUrlAbsolueVersPage(urlRedirection),
    });
  });

  app.get(
    '/motDePasse/edition',
    middleware.verificationJWT,
    (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) =>
        reponse.render('motDePasse/edition', {
          utilisateur,
          afficheChallengeMotDePasse: true,
        })
      );
    }
  );

  app.get(
    '/motDePasse/initialisation',
    middleware.verificationJWT,
    (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          reponse.render('motDePasse/edition', { utilisateur })
        );
    }
  );

  // Pour que les utilisateurs ayant cette page en favoris ne soient pas perdus.
  app.get('/questionsFrequentes', (_requete, reponse) => {
    reponse.redirect('https://aide.monservicesecurise.ssi.gouv.fr');
  });

  app.get('/mentionsLegales', (_requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  app.get('/statistiques', (_requete, reponse) => {
    reponse.render('statistiques');
  });

  app.get(
    '/reinitialisationMotDePasse',
    middleware.suppressionCookie,
    (_requete, reponse) => {
      reponse.render('reinitialisationMotDePasse');
    }
  );

  app.get('/inscription', (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('inscription', { departements });
  });

  app.get('/activation', (_requete, reponse) => {
    reponse.render('activation');
  });

  app.get(
    '/initialisationMotDePasse/:idReset',
    middleware.aseptise('idReset'),
    async (requete, reponse) => {
      const { idReset } = requete.params;

      const pasUnUUID = !uuid.validate(idReset);
      if (pasUnUUID) {
        reponse.status(400).send(`UUID requis`);
        return;
      }

      const utilisateur = await depotDonnees.utilisateurAFinaliser(idReset);
      if (!utilisateur) {
        reponse
          .status(404)
          .send(`Identifiant d'initialisation de mot de passe inconnu`);
        return;
      }

      requete.session.token = utilisateur.genereToken();
      reponse.render('motDePasse/edition', { utilisateur });
    }
  );

  app.get(
    '/espacePersonnel',
    middleware.verificationAcceptationCGU,
    (_requete, reponse) => {
      reponse.redirect('tableauDeBord');
    }
  );

  app.get(
    '/tableauDeBord',
    middleware.verificationAcceptationCGU,
    middleware.chargeEtatVisiteGuidee,
    (_requete, reponse) => {
      reponse.render('tableauDeBord');
    }
  );

  app.get(
    '/historiqueProduit',
    middleware.verificationAcceptationCGU,
    (_requete, reponse) => {
      reponse.render('historiqueProduit');
    }
  );

  app.use(
    '/api',
    routesApiPublique({
      middleware,
      referentiel,
      depotDonnees,
      serviceAnnuaire,
      adaptateurTracking,
      adaptateurMail,
    })
  );
  app.use('/bibliotheques', routesBibliotheques());
  app.use('/styles', routesStyles());

  app.use(
    '/api',
    middleware.verificationJWT,
    routesConnecteApi({
      middleware,
      adaptateurMail,
      depotDonnees,
      referentiel,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurCsv,
      adaptateurZip,
      adaptateurJournalMSS,
      procedures,
      serviceAnnuaire,
    })
  );

  app.use(
    '/service',
    middleware.verificationJWT,
    routesService({
      middleware,
      referentiel,
      depotDonnees,
      moteurRegles,
      adaptateurCsv,
      adaptateurGestionErreur,
      adaptateurHorloge,
    })
  );

  app.get(
    '/utilisateur/edition',
    middleware.verificationJWT,
    (requete, reponse) => {
      const departements = referentiel.departements();
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          reponse.render('utilisateur/edition', { utilisateur, departements })
        );
    }
  );

  app.get(
    '/visiteGuidee/:idEtape',
    middleware.verificationJWT,
    middleware.chargePreferencesUtilisateur,
    middleware.chargeEtatVisiteGuidee,
    (requete, reponse) => {
      const utilisateurVisiteGuidee = new Utilisateur({
        email: 'visite-guidee@cyber.gouv.fr',
      });
      const service = Service.creePourUnUtilisateur(utilisateurVisiteGuidee);
      service.id = 'ID-SERVICE-VISITE-GUIDEE';

      const { idEtape } = requete.params;
      reponse.locals.etatVisiteGuidee = {
        ...reponse.locals.etatVisiteGuidee,
        etapeCourante: idEtape.toUpperCase(),
      };
      reponse.locals.autorisationsService = {
        DECRIRE: { estMasque: false },
        SECURISER: { estMasque: false, estLectureSeule: false },
        HOMOLOGUER: { estMasque: false },
        RISQUES: { estMasque: false },
        CONTACTS: { estMasque: false },
        peutHomologuer: false,
      };

      if (idEtape === 'decrire') {
        reponse.render('service/creation', {
          InformationsHomologation,
          referentiel,
          service,
          etapeActive: 'descriptionService',
          departements: referentiel.departements(),
        });
      } else if (idEtape === 'securiser') {
        const mesures = moteurRegles.mesures(service.descriptionService);
        const pourcentageProgression = 80;

        service.indiceCyber = () => ({ total: 4.3 });
        reponse.render('service/mesures', {
          InformationsHomologation,
          referentiel,
          service,
          etapeActive: 'mesures',
          pourcentageProgression,
          mesures,
        });
      } else if (idEtape === 'homologuer') {
        reponse.render('service/dossiers', {
          InformationsHomologation,
          decode,
          service,
          etapeActive: 'dossiers',
          premiereEtapeParcours: referentiel.premiereEtapeParcours(),
          peutVoirTamponHomologation: true,
          referentiel,
        });
      } else if (idEtape === 'piloter') {
        reponse.render('tableauDeBord');
      }
    }
  );

  app.use(
    '/statique',
    express.static('public', {
      setHeaders: (reponse) =>
        reponse.setHeader('cache-control', CACHE_CONTROL_FICHIERS_STATIQUES),
    })
  );

  app.use(adaptateurGestionErreur.controleurErreurs);

  if (avecPageErreur) {
    app.use((_erreur, _requete, reponse, _suite) => {
      reponse.render('erreur');
    });
  }

  const ecoute = (port, succes) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute };
};

module.exports = { creeServeur };
