import express from 'express';
import { z } from 'zod';
import routesConnectePageService from './routesConnectePageService.js';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
import { VersionService } from '../../modeles/versionService.js';
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
    async (_requete, reponse) => {
      reponse.redirect('/admin/statistiques');
    }
  );

  routes.get('/utilisateur/edition', async (_requete, reponse) => {
    reponse.redirect(301, '/profil');
  });

  routes.get(
    '/profil',
    middleware.verificationAcceptationCGU,
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
    '/visiteGuidee',
    middleware.verificationAcceptationCGU,
    (_requete, reponse) => {
      reponse.render('visiteGuidee/spa', { referentiel, referentielV2 });
    }
  );

  routes.get(
    '/mesures',
    middleware.verificationAcceptationCGU,
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
    routesConnectePageAdmin({
      depotDonnees,
      adaptateurEnvironnement,
      referentiel,
      referentielV2,
    })
  );

  return routes;
};

export default routesConnectePage;
