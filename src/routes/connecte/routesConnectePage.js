const express = require('express');
const { decode } = require('html-entities');
const Utilisateur = require('../../modeles/utilisateur');
const Service = require('../../modeles/service');
const InformationsService = require('../../modeles/informationsService');
const routesConnectePageService = require('./routesConnectePageService');

const routesConnectePage = ({
  middleware,
  moteurRegles,
  depotDonnees,
  referentiel,
  adaptateurCsv,
  adaptateurGestionErreur,
  adaptateurHorloge,
}) => {
  const routes = express.Router();

  routes.get(
    '/motDePasse/edition',
    middleware.verificationAcceptationCGU,
    middleware.chargeEtatVisiteGuidee,
    (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) =>
        reponse.render('motDePasse/edition', {
          utilisateur,
        })
      );
    }
  );

  routes.get(
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

  routes.get(
    '/acceptationCGU',
    middleware.verificationJWT,
    async (_requete, reponse) => {
      reponse.render('acceptationCGU');
    }
  );

  routes.get('/utilisateur/edition', async (_requete, reponse) => {
    reponse.redirect(301, '/profil');
  });

  routes.get(
    '/profil',
    middleware.verificationAcceptationCGU,
    middleware.chargeEtatVisiteGuidee,
    async (requete, reponse) => {
      const departements = referentiel.departements();
      const estimationNombreServices = referentiel.estimationNombreServices();
      const idUtilisateur = requete.idUtilisateurCourant;
      const utilisateur = await depotDonnees.utilisateur(idUtilisateur);
      const { entite } = utilisateur;

      reponse.render('profil', {
        utilisateur,
        departements,
        estimationNombreServices,
        entite,
      });
    }
  );

  routes.get(
    '/tableauDeBord',
    middleware.verificationAcceptationCGU,
    middleware.chargeEtatVisiteGuidee,
    (_requete, reponse) => {
      reponse.render('tableauDeBord');
    }
  );

  routes.get('/deconnexion', middleware.verificationJWT, (requete, reponse) => {
    if (requete.sourceAuthentification === 'MSS') {
      reponse.redirect('/connexion');
      return;
    }
    reponse.redirect('/oidc/deconnexion');
  });

  routes.get(
    '/visiteGuidee/:idEtape',
    middleware.positionneHeadersAvecNonce,
    middleware.verificationAcceptationCGU,
    middleware.chargePreferencesUtilisateur,
    middleware.chargeEtatVisiteGuidee,
    (requete, reponse) => {
      const utilisateurVisiteGuidee = new Utilisateur({
        email: 'visite-guidee@cyber.gouv.fr',
      });
      const service = Service.creePourUnUtilisateur(utilisateurVisiteGuidee);
      service.id = 'ID-SERVICE-VISITE-GUIDEE';

      const { idEtape } = requete.params;
      const idEtapeCourante = idEtape.toUpperCase();
      const idEtapePrecedente =
        referentiel.etapePrecedenteVisiteGuidee(idEtapeCourante);
      const etapePrecedente = referentiel.etapeVisiteGuidee(idEtapePrecedente);
      reponse.locals.etatVisiteGuidee = {
        ...reponse.locals.etatVisiteGuidee,
        etapeCourante: idEtapeCourante,
        urlEtapePrecedente: etapePrecedente?.urlEtape,
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
          InformationsService,
          referentiel,
          service,
          etapeActive: 'descriptionService',
          departements: referentiel.departements(),
        });
      } else if (idEtape === 'securiser') {
        const mesures = moteurRegles.mesures(service.descriptionService);

        service.indiceCyber = () => ({ total: 4.3 });
        service.indiceCyberPersonnalise = () => ({ total: 4.6 });
        reponse.render('service/mesures', {
          InformationsService,
          referentiel,
          service,
          etapeActive: 'mesures',
          mesures,
        });
      } else if (idEtape === 'homologuer') {
        reponse.render('service/dossiers', {
          InformationsService,
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

  routes.use(
    '/service',
    middleware.verificationAcceptationCGU,
    middleware.chargeEtatVisiteGuidee,
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

  return routes;
};

module.exports = routesConnectePage;
