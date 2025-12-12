import express from 'express';
import Utilisateur from '../../modeles/utilisateur.js';
import Service from '../../modeles/service.js';
import InformationsService from '../../modeles/informationsService.js';
import routesConnectePageService from './routesConnectePageService.js';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
import { VersionService } from '../../modeles/versionService.js';

const routesConnectePage = ({
  middleware,
  moteurRegles,
  depotDonnees,
  referentiel,
  referentielV2,
  adaptateurCsv,
  adaptateurGestionErreur,
  adaptateurHorloge,
  adaptateurEnvironnement,
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
    '/supervision',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const superviseur = await depotDonnees.superviseur(
        requete.idUtilisateurCourant
      );

      if (!superviseur) {
        reponse.sendStatus(401);
        return;
      }
      reponse.render('supervision', {
        referentiel,
        entitesSupervisees: superviseur.entitesSupervisees,
      });
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
      await depotDonnees.rafraichisProfilUtilisateurLocal(idUtilisateur);
      const utilisateur = await depotDonnees.utilisateur(idUtilisateur);
      const entite = utilisateur.entite.siret ? utilisateur.entite : undefined;

      reponse.render('profil', {
        utilisateur: utilisateur.toJSON(),
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
    middleware.chargeExplicationNouveauReferentiel,
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete;
      const estSuperviseur =
        await depotDonnees.estSuperviseur(idUtilisateurCourant);
      await depotDonnees.marqueTableauDeBordVuDansParcoursUtilisateur(
        idUtilisateurCourant
      );
      reponse.render('tableauDeBord', { estSuperviseur });
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
    middleware.verificationAcceptationCGU,
    middleware.chargePreferencesUtilisateur,
    middleware.chargeEtatVisiteGuidee,
    (requete, reponse) => {
      const utilisateurVisiteGuidee = new Utilisateur({
        email: 'visite-guidee@cyber.gouv.fr',
      });
      const service = Service.creePourUnUtilisateur(utilisateurVisiteGuidee);
      service.id = 'ID-SERVICE-VISITE-GUIDEE';
      service.descriptionService.niveauSecurite = 'niveau2';
      service.versionService = 'v1';

      const { idEtape } = requete.params;
      const idEtapeCourante = idEtape.toUpperCase();
      const idEtapePrecedente =
        referentiel.etapePrecedenteVisiteGuidee(idEtapeCourante);
      const etapePrecedente = referentiel.etapeVisiteGuidee(idEtapePrecedente);
      reponse.locals.etatVisiteGuidee = {
        ...reponse.locals.etatVisiteGuidee,
        etapeCourante: idEtapeCourante,
        urlEtapePrecedente: etapePrecedente?.urlEtape,
        dejaTerminee: false,
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
        if (adaptateurEnvironnement.featureFlag().avecDecrireV2())
          reponse.render('visiteGuidee/creationService');
        else
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

  routes.get(
    '/mesures',
    middleware.verificationAcceptationCGU,
    middleware.chargeEtatVisiteGuidee,
    async (_, reponse) => {
      const typesV1 = referentiel.typesService();
      const typesV2 = Object.fromEntries(
        Object.entries(questionsV2.typeDeService).map(([cle, { nom }]) => [
          cle,
          { description: nom },
        ])
      );
      reponse.render('listeMesures', {
        statutsMesures: referentiel.statutsMesures(),
        categoriesMesures: referentiel.categoriesMesures(),
        typesService: { ...typesV1, ...typesV2 },
        nombreMaximumDeModelesMesureSpecifiqueParUtilisateur:
          referentiel.nombreMaximumDeModelesMesureSpecifiqueParUtilisateur(),
      });
    }
  );

  routes.get(
    '/mesures/export.csv',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      try {
        const { version } = requete.query;
        const modelesMesureSpecifique =
          await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
            requete.idUtilisateurCourant
          );
        const mesuresGenerales =
          version === VersionService.v2
            ? referentielV2.mesures()
            : referentiel.mesures();
        const bufferCsv = await adaptateurCsv.genereCsvMesures(
          {
            mesuresGenerales,
            mesuresSpecifiques: modelesMesureSpecifique,
          },
          [],
          false,
          referentiel,
          false
        );
        reponse
          .contentType('text/csv;charset=utf-8')
          .set(
            'Content-Disposition',
            `attachment; filename="referentiel-mesures-MSS.csv"`
          )
          .send(bufferCsv);
      } catch (e) {
        adaptateurGestionErreur.logueErreur(e);
        reponse.sendStatus(424);
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

export default routesConnectePage;
