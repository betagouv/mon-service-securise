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
const routesConnectePageService = require('./routes/connecte/routesConnectePageService');
const routesNonConnecteApi = require('./routes/nonConnecte/routesNonConnecteApi');
const {
  routesNonConnecteApiBibliotheques,
} = require('./routes/nonConnecte/routesNonConnecteApiBibliotheques');
const routesNonConnecteApiStyles = require('./routes/nonConnecte/routesNonConnecteApiStyles');
const InformationsHomologation = require('./modeles/informationsHomologation');
const Service = require('./modeles/service');
const Utilisateur = require('./modeles/utilisateur');
const routesNonConnectePage = require('./routes/nonConnecte/routesNonConnectePage');
const routesConnectePage = require('./routes/connecte/routesConnectePage');

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

  app.use('', routesNonConnectePage({ depotDonnees, middleware, referentiel }));
  app.use('', middleware.verificationJWT, routesConnectePage({ depotDonnees }));

  app.use(
    '/api',
    routesNonConnecteApi({
      middleware,
      referentiel,
      depotDonnees,
      serviceAnnuaire,
      adaptateurTracking,
      adaptateurMail,
    })
  );
  app.use('/bibliotheques', routesNonConnecteApiBibliotheques());
  app.use('/styles', routesNonConnecteApiStyles());

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
    routesConnectePageService({
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
