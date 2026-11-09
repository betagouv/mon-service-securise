import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { Middleware } from '../../http/middleware.interface.js';

export const routesConnecteApiServicePowerpoint = ({
  middleware,
}: {
  middleware: Middleware;
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/powerpoint/supportCommissionHomologation.pptx',
    middleware.trouveService(Autorisation.DROITS_DOSSIER_DECISION_PDF),
    (_requete, reponse) => {
      reponse.sendStatus(200);
    }
  );

  return routes;
};
