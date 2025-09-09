import express from 'express';
import * as z from 'zod';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { UUID } from '../../typesBasiques.js';

const routesConnecteApiBrouillonService = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesBrouillonService;
}) => {
  const routes = express.Router();

  routes.post(
    '/',
    valideBody(
      z.strictObject({
        nomService: z.string().trim().nonempty(),
      })
    ),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const { nomService } = requete.body;

      const id = await depotDonnees.nouveauBrouillonService(
        idUtilisateurCourant,
        nomService
      );

      return reponse.json({ id });
    }
  );

  routes.post(
    '/:id/finalise',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    async (requete, reponse) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id } = requete.params;

      const idService = await depotDonnees.finaliseBrouillonService(
        idUtilisateurCourant,
        id as UUID
      );

      return reponse.json({ idService });
    }
  );

  return routes;
};

export default routesConnecteApiBrouillonService;
