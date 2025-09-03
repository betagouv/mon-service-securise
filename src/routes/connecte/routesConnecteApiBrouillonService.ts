import express, { Request, Response } from 'express';
import * as z from 'zod';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody } from '../../http/valideBody.js';

const routesConnecteApiBrouillonService = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesBrouillonService;
}) => {
  const routes = express.Router();

  const BrouillonHttp = z.strictObject({
    nomService: z.string().trim().nonempty(),
  });
  routes.post(
    '/',
    valideBody(BrouillonHttp),
    async (requete: Request, reponse: Response) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const { nomService } = BrouillonHttp.parse(requete.body);

      const id = await depotDonnees.nouveauBrouillonService(
        idUtilisateurCourant,
        nomService
      );

      return reponse.json({ id });
    }
  );

  return routes;
};

export default routesConnecteApiBrouillonService;
