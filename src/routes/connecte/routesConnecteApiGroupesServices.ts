import express, { NextFunction, Response } from 'express';
import { z } from 'zod';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { GroupeServices } from '../../modeles/groupeServices.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  ErreurGroupeServicesDejaExistant,
  ErreurGroupeServicesInexistant,
} from '../../erreurs.js';
import { UUID } from '../../typesBasiques.js';
import {
  schemaIdGroupeServices,
  schemaLibelleGroupeServices,
} from './routesConnecteApiGroupesServices.schema.js';

const enJSON = (groupe: GroupeServices) => {
  const { id, libelle } = groupe.donnees();
  return { id, libelle };
};

const traduisErreur = (
  erreur: unknown,
  reponse: Response,
  suite: NextFunction
) => {
  if (erreur instanceof ErreurGroupeServicesInexistant) {
    reponse.sendStatus(404);
    return;
  }
  if (erreur instanceof ErreurGroupeServicesDejaExistant) {
    reponse
      .status(422)
      .json({ erreur: { code: 'LIBELLE_GROUPE_DEJA_EXISTANT' } });
    return;
  }
  suite(erreur);
};

const routesConnecteApiGroupesServices = ({
  depotDonnees,
  adaptateurEnvironnement,
}: {
  depotDonnees: DepotDonnees;
  adaptateurEnvironnement: AdaptateurEnvironnement;
}) => {
  const routes = express.Router();

  routes.use((_requete, reponse, suite) => {
    if (!adaptateurEnvironnement.featureFlag().avecGroupesServices()) {
      reponse.sendStatus(404);
      return;
    }
    suite();
  });

  routes.get('/', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const groupes = await depotDonnees.lisGroupesDe(idUtilisateurCourant);

    reponse.json(groupes.map(enJSON));
  });

  routes.post(
    '/',
    valideBody(z.strictObject(schemaLibelleGroupeServices())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;

      try {
        const groupe = await depotDonnees.nouveauGroupe(
          idUtilisateurCourant,
          requete.body.libelle
        );

        reponse.status(201).json(enJSON(groupe));
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  routes.put(
    '/:id',
    valideParams(z.strictObject(schemaIdGroupeServices())),
    valideBody(z.strictObject(schemaLibelleGroupeServices())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      try {
        await depotDonnees.renommeGroupe(
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
    valideParams(z.strictObject(schemaIdGroupeServices())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      try {
        await depotDonnees.supprimeGroupe(
          requete.params.id as UUID,
          idUtilisateurCourant
        );

        reponse.sendStatus(200);
      } catch (e) {
        traduisErreur(e, reponse, suite);
      }
    }
  );

  return routes;
};

export { routesConnecteApiGroupesServices };
