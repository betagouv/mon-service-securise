import express, { Request, Response } from 'express';
import { fabriqueAdaptateurUUID } from '../../adaptateurs/adaptateurUUID.js';
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

    await depotDonnees.nouveauBrouillonService(
      idUtilisateurCourant,
      requete.body.nomService
    );

    reponse.send({ id: fabriqueAdaptateurUUID().genereUUID() });
  });

  return routes;
};

export default routesConnecteApiBrouillonService;
