import express from 'express';
import z from 'zod';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  schemaAttributionRoleServices,
  schemaDeleteAdmin,
  schemaPostAdminNomme,
  schemaPutPerimetreAdmin,
  schemaRetraitAccesServices,
} from './routesConnecteApiAdmin.schema.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import { Middleware } from '../../http/middleware.interface.js';
import {
  EchecAutorisation,
  ErreurEntiteNonAdministre,
  ErreurServiceNonAdministre,
  ErreurSuppressionImpossible,
  ErreurUtilisateurNonAdministre,
} from '../../erreurs.js';

type Configuration = {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
};

const routesConnecteApiAdmin = ({
  depotDonnees,
  middleware,
  serviceAdministrationOrganisations,
}: Configuration) => {
  const routes = express.Router();

  routes.get('/entites', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const entites =
      await serviceAdministrationOrganisations.entitesDe(idUtilisateurCourant);
    const entitesAvecInfoUtilisateurCourant = entites.map((e) => ({
      ...e,
      administrateurs: e.administrateurs.map((a) => ({
        ...a,
        estUtilisateurCourant: a.id === idUtilisateurCourant,
      })),
    }));

    reponse.json(entitesAvecInfoUtilisateurCourant);
  });

  routes.get('/utilisateurs', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const utilisateurs =
      await serviceAdministrationOrganisations.utilisateursDansLePerimetreDe(
        idUtilisateurCourant
      );

    reponse.json(
      utilisateurs.map((u) => ({
        id: u.id,
        prenomNom: u.prenomNom(),
        email: u.email(),
        postes: u.posteDetaille(),
        estAdmin: u.estAdmin,
        nombreEntites: u.nombreEntites,
        autorisations: u.autorisations.map((a) => ({
          idService: a.idService,
          role: a.resumeNiveauDroit(),
        })),
      }))
    );
  });

  routes.post(
    '/utilisateurs/:idUtilisateur/roles',
    valideBody(schemaAttributionRoleServices),
    valideParams(z.looseObject({ idUtilisateur: z.uuid() })),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { idsServices, role } = requete.body;
      const { idUtilisateur } = requete.params;

      try {
        await serviceAdministrationOrganisations.attribueRoleAUtilisateurAdministre(
          idUtilisateurCourant,
          idUtilisateur as UUID,
          role,
          idsServices as UUID[]
        );
      } catch (e) {
        if (
          e instanceof ErreurUtilisateurNonAdministre ||
          e instanceof ErreurServiceNonAdministre
        ) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof EchecAutorisation) {
          reponse.sendStatus(422);
          return;
        }
        suite(e);
      }

      reponse.sendStatus(200);
    }
  );

  routes.delete(
    '/utilisateurs/:idUtilisateur/roles',
    valideBody(schemaRetraitAccesServices),
    valideParams(z.looseObject({ idUtilisateur: z.uuid() })),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { idsServices } = requete.body;
      const { idUtilisateur } = requete.params;

      try {
        await serviceAdministrationOrganisations.retireAccesUtilisateurAdministre(
          idUtilisateurCourant,
          idUtilisateur as UUID,
          idsServices as UUID[]
        );
      } catch (e) {
        if (
          e instanceof ErreurUtilisateurNonAdministre ||
          e instanceof ErreurServiceNonAdministre
        ) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof EchecAutorisation) {
          reponse.sendStatus(422);
          return;
        }
        suite(e);
      }

      reponse.sendStatus(200);
    }
  );

  routes.put(
    '/utilisateurs/:idUtilisateur/perimetre',
    valideBody(schemaPutPerimetreAdmin),
    valideParams(z.looseObject({ idUtilisateur: z.uuid() })),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant: idActeur } =
        requete as unknown as RequestRouteConnecte;
      const { idUtilisateur: idAdmin } = requete.params;
      const { siretsAAjouter, siretsARetirer } = requete.body;

      try {
        await serviceAdministrationOrganisations.assignePerimetre(
          idActeur,
          idAdmin as UUID,
          siretsAAjouter,
          siretsARetirer
        );
      } catch (e) {
        if (e instanceof ErreurEntiteNonAdministre) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof ErreurSuppressionImpossible) {
          reponse.sendStatus(422);
          return;
        }
        suite(e);
      }

      reponse.sendStatus(200);
    }
  );

  routes.post(
    '/verifieEmail',
    middleware.protegeTrafic(),
    valideBody(z.strictObject({ email: z.email() })),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const superviseur =
        await depotDonnees.lisSuperviseur(idUtilisateurCourant);
      const admin =
        await depotDonnees.lisAdminOrganisations(idUtilisateurCourant);

      if (!superviseur && !admin) {
        reponse.sendStatus(403);
        return;
      }

      const cible = await depotDonnees.utilisateurAvecEmail(requete.body.email);

      reponse.json({ existe: !!cible });
    }
  );

  routes.post(
    '/nomme',
    valideBody(schemaPostAdminNomme),
    async (requete, reponse, suite) => {
      const { emails, siret } = requete.body;
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;

      const nommeAdmin = async (email: string) => {
        const utilisateur = await depotDonnees.utilisateurAvecEmail(email);
        if (!utilisateur) return;
        await serviceAdministrationOrganisations.nommeAdmin(
          idUtilisateurCourant,
          siret,
          utilisateur!.id
        );
      };

      try {
        await Promise.all([...new Set(emails)].map(nommeAdmin));
        reponse.sendStatus(200);
      } catch (erreur) {
        if (erreur instanceof ErreurEntiteNonAdministre) {
          reponse.sendStatus(403);
          return;
        }
        if (erreur instanceof EchecAutorisation) {
          reponse.sendStatus(400);
          return;
        }
        suite(erreur);
      }
    }
  );

  routes.delete(
    '/',
    valideBody(schemaDeleteAdmin),
    async (requete, reponse, suite) => {
      const { siret, idUtilisateur } = requete.body;
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;

      try {
        await serviceAdministrationOrganisations.retireAdmin(
          idUtilisateurCourant,
          siret,
          idUtilisateur as UUID
        );
        reponse.sendStatus(200);
      } catch (erreur) {
        if (erreur instanceof ErreurSuppressionImpossible) {
          reponse.sendStatus(422);
          return;
        }
        if (erreur instanceof ErreurEntiteNonAdministre) {
          reponse.sendStatus(403);
          return;
        }
        if (erreur instanceof EchecAutorisation) {
          reponse.sendStatus(400);
          return;
        }
        suite(erreur);
      }
    }
  );

  return routes;
};

export { routesConnecteApiAdmin };
