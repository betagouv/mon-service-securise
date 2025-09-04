import express, { Request, Response } from 'express';
import * as z from 'zod';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody } from '../../http/valideBody.js';
import { UUID } from '../../typesBasiques.js';

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

  routes.post('/:id/finalise', async (requete: Request, reponse: Response) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;
    const { id } = requete.params;
    const idService = await depotDonnees.finaliseBrouillonService(
      idUtilisateurCourant,
      id as UUID
    );
    return reponse.json({ idService });
  });

  return routes;
};

export default routesConnecteApiBrouillonService;
