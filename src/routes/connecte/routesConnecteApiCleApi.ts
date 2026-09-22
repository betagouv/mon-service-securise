import express from 'express';
import { z } from 'zod';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  schemaDeleteCleApi,
  schemaPostCleApi,
} from './routesConnecteApiCleApi.schema.js';
import { ErreurCleApiInexistante } from '../../erreurs.js';
import { UUID } from '../../typesBasiques.js';

const routesConnecteApiCleApi = ({
  depotDonnees,
  adaptateurEnvironnement,
}: {
  depotDonnees: DepotDonnees;
  adaptateurEnvironnement: AdaptateurEnvironnement;
}) => {
  const routes = express.Router();

  routes.use((requete, reponse, suite) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;
    if (
      !adaptateurEnvironnement
        .featureFlag()
        .avecAccesCreationCleApi(idUtilisateurCourant)
    ) {
      reponse.sendStatus(404);
      return;
    }
    suite();
  });

  routes.post(
    '/',
    valideBody(z.strictObject(schemaPostCleApi())),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const { dureeValiditeEnJours } = requete.body;

      const { cle, valeurEnClair } = await depotDonnees.nouvelleCle(
        idUtilisateurCourant,
        dureeValiditeEnJours
      );
      const { id, prefixe, dateCreation, dateExpiration } = cle.donnees();

      reponse
        .status(201)
        .json({ id, prefixe, dateCreation, dateExpiration, valeurEnClair });
    }
  );

  routes.delete(
    '/:id',
    valideParams(z.strictObject(schemaDeleteCleApi())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      try {
        await depotDonnees.revoqueCle(
          requete.params.id as UUID,
          idUtilisateurCourant
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurCleApiInexistante) {
          reponse.sendStatus(404);
          return;
        }
        suite(e);
      }
    }
  );

  return routes;
};

export { routesConnecteApiCleApi };
