import express, { Request, Response } from 'express';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';

const routesConnecteApiBrouillonService = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesBrouillonService;
}) => {
  const routes = express.Router();

  routes.post('/', async (requete: Request, reponse: Response) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const id = await depotDonnees.nouveauBrouillonService(
      idUtilisateurCourant,
      requete.body.nomService
    );

    return reponse.json({ id });
  });

  return routes;
};

export default routesConnecteApiBrouillonService;
