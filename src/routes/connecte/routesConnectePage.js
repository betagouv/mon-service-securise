import express from 'express';
import { z } from 'zod';
import Utilisateur from '../../modeles/utilisateur.js';
import Service from '../../modeles/service.js';
import routesConnectePageService from './routesConnectePageService.js';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
import { VersionService } from '../../modeles/versionService.js';
import { adaptateurJWT } from '../../adaptateurs/adaptateurJWT.js';
import { routesConnectePageAdmin } from './routesConnectePageAdmin.js';
import { valideQuery } from '../../http/validePayloads.js';

const routesConnectePage = ({
  middleware,
  depotDonnees,
  referentiel,
  referentielV2,
  adaptateurCsv,
  adaptateurGestionErreur,
  adaptateurHorloge,
  gestionnaireSession,
  adaptateurEnvironnement,
}) => {
  const routes = express.Router();

  routes.get(
    '/supervision',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const superviseur = await depotDonnees.lisSuperviseur(
        requete.idUtilisateurCourant
      );

      if (!superviseur) {
        reponse.sendStatus(401);
        return;
      }
      reponse.render('supervision', {
        referentiel,
        entitesSupervisees: superviseur.donnees().entitesSupervisees,
      });
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
    middleware.chargeExplicationUtilisationMFA,
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete;
      await depotDonnees.marqueTableauDeBordVuDansParcoursUtilisateur(
        idUtilisateurCourant
      );
      reponse.render('tableauDeBord');
    }
  );

  routes.get(
    '/deconnexion',
    middleware.verificationJWT,
    async (requete, reponse) => {
      await gestionnaireSession.revoqueSession(requete);

      reponse.redirect('/oidc/deconnexion');
    }
  );

  routes.get(
    '/visiteGuidee/:idEtape',
    middleware.verificationAcceptationCGU,
    middleware.chargeExplicationNouveauReferentiel,
    middleware.chargeExplicationUtilisationMFA,
    middleware.chargeExplicationRisquesV2,
    middleware.chargeEtatVisiteGuidee,
    (requete, reponse) => {
      const utilisateurVisiteGuidee = new Utilisateur(
        { email: 'visite-guidee@cyber.gouv.fr' },
        { adaptateurJWT }
      );
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
        reponse.render('visiteGuidee/creationService');
      } else if (idEtape === 'mesures') {
        reponse.render('service/pagesService', {
          referentiel,
          service,
          etapeActive: 'mesures',
        });
      } else if (idEtape === 'dossiers') {
        reponse.render('service/pagesService', {
          service,
          etapeActive: 'dossiers',
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
    valideQuery(
      z.strictObject({
        version: z.enum(VersionService).optional(),
        avecReferentielsExternes: z.stringbool().optional().default(false),
      })
    ),
    async (requete, reponse) => {
      try {
        const { version, avecReferentielsExternes } = requete.query;
        const modelesMesureSpecifique =
          await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
            requete.idUtilisateurCourant
          );
        const referentielAUtiliser =
          version === VersionService.v2 ? referentielV2 : referentiel;
        const mesuresGenerales = referentielAUtiliser.mesures();
        const bufferCsv = await adaptateurCsv.genereCsvMesures(
          {
            mesuresGenerales,
            mesuresSpecifiques: modelesMesureSpecifique,
          },
          [],
          false,
          referentielAUtiliser,
          false,
          avecReferentielsExternes
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
      adaptateurCsv,
      adaptateurGestionErreur,
      adaptateurHorloge,
    })
  );

  routes.use(
    '/admin',
    middleware.verificationAcceptationCGU,
    routesConnectePageAdmin({ depotDonnees, adaptateurEnvironnement })
  );

  return routes;
};

export default routesConnectePage;
