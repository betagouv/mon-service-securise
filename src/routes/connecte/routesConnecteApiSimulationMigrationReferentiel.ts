import express from 'express';
import * as z from 'zod';
import { UUID } from '../../typesBasiques.js';
import { DepotDonneesSimulationMigrationReferentiel } from '../../depots/depotDonneesSimulationMigrationReferentiel.js';
import { ErreurSimulationInexistante } from '../../erreurs.js';
import { valideParams } from '../../http/validePayloads.js';

const routesConnecteApiSimulationMigrationReferentiel = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesSimulationMigrationReferentiel;
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/simulation-migration-referentiel',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    async (requete, reponse, suite) => {
      // Le validateur étant instancié dans le routeur au-dessus, Typescript ne voit pas les `params` ici
      const { id: idService } = requete.params;

      try {
        const simulation = await depotDonnees.lisSimulationMigrationReferentiel(
          idService as UUID
        );

        return reponse.json(simulation.toJSON());
      } catch (e) {
        if (e instanceof ErreurSimulationInexistante)
          return reponse.sendStatus(404);
        return suite(e);
      }
    }
  );

  return routes;
};

export default routesConnecteApiSimulationMigrationReferentiel;
