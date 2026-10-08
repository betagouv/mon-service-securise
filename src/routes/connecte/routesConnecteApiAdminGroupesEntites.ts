import express, { NextFunction, Response } from 'express';
import { z } from 'zod';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { UUID } from '../../typesBasiques.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  schemaAssociationGroupeEntites,
  schemaDissociationGroupeEntites,
  schemaIdGroupeEntites,
  schemaLibelleGroupeEntites,
} from './routesConnecteApiAdminGroupesEntites.schema.js';
import {
  ErreurEntiteNonAdministre,
  ErreurGroupeEntitesDejaExistant,
  ErreurGroupeEntitesInexistant,
} from '../../erreurs.js';

const traduisErreur = (
  erreur: unknown,
  reponse: Response,
  suite: NextFunction
) => {
  if (erreur instanceof ErreurEntiteNonAdministre) {
    reponse.sendStatus(403);
    return;
  }
  if (erreur instanceof ErreurGroupeEntitesInexistant) {
    reponse.sendStatus(404);
    return;
  }
  if (erreur instanceof ErreurGroupeEntitesDejaExistant) {
    reponse
      .status(422)
      .json({ erreur: { code: 'LIBELLE_GROUPE_DEJA_EXISTANT' } });
    return;
  }
  suite(erreur);
};

const routesConnecteApiAdminGroupesEntites = ({
  depotDonnees,
  adaptateurEnvironnement,
}: {
  depotDonnees: DepotDonnees;
  adaptateurEnvironnement: AdaptateurEnvironnement;
}) => {
  const routes = express.Router();

  routes.use((_requete, reponse, suite) => {
    if (!adaptateurEnvironnement.featureFlag().avecGroupesEntites()) {
      reponse.sendStatus(404);
      return;
    }
    suite();
  });

  routes.use(async (requete, reponse, suite) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;
    const [estAdmin, estSuperviseur] = await Promise.all([
      depotDonnees.estAdmin(idUtilisateurCourant),
      depotDonnees.estSuperviseur(idUtilisateurCourant),
    ]);
    if (!estAdmin && !estSuperviseur) {
      reponse.sendStatus(403);
      return;
    }
    suite();
  });

  routes.get('/', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const groupes =
      await depotDonnees.lisGroupesEntitesDe(idUtilisateurCourant);

    reponse.json(groupes.map((g) => g.toJSON()));
  });

  routes.post(
    '/',
    valideBody(z.strictObject(schemaLibelleGroupeEntites())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;

      try {
        const groupe = await depotDonnees.nouveauGroupeEntites(
          idUtilisateurCourant,
          requete.body.libelle
        );

        reponse.status(201).json(groupe.toJSON());
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  routes.put(
    '/:id',
    valideParams(z.strictObject(schemaIdGroupeEntites())),
    valideBody(z.strictObject(schemaLibelleGroupeEntites())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      try {
        await depotDonnees.renommeGroupeEntites(
          requete.params.id as UUID,
          idUtilisateurCourant,
          requete.body.libelle
        );

        reponse.sendStatus(200);
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  routes.delete(
    '/:id',
    valideParams(z.strictObject(schemaIdGroupeEntites())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      try {
        await depotDonnees.supprimeGroupeEntites(
          requete.params.id as UUID,
          idUtilisateurCourant
        );

        reponse.sendStatus(200);
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  routes.post(
    '/associations',
    valideBody(z.strictObject(schemaAssociationGroupeEntites())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const { idsGroupes, sirets } = requete.body;

      try {
        await depotDonnees.associeEntitesAuxGroupes(
          idUtilisateurCourant,
          idsGroupes as UUID[],
          sirets
        );

        reponse.sendStatus(200);
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  routes.delete(
    '/:id/associations',
    valideParams(z.strictObject(schemaIdGroupeEntites())),
    valideBody(z.strictObject(schemaDissociationGroupeEntites())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      try {
        await depotDonnees.supprimeAssociationEntitesAuGroupe(
          idUtilisateurCourant,
          requete.params.id as UUID,
          requete.body.sirets
        );

        reponse.sendStatus(200);
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  return routes;
};

export { routesConnecteApiAdminGroupesEntites };
