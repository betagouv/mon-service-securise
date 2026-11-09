import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';

export const routesConnecteApiServicePowerpoint = ({
  middleware,
  adaptateurEnvironnement,
}: {
  middleware: Middleware;
  adaptateurEnvironnement: AdaptateurEnvironnement;
}) => {
  const routes = express.Router();

  routes.use('/:id/pptx', (_requete, reponse, suite) => {
    if (!adaptateurEnvironnement.featureFlag().avecSupportCommissionPptx()) {
      reponse.sendStatus(404);
      return;
    }
    suite();
  });

  routes.get(
    '/:id/pptx/supportCommissionHomologation.pptx',
    middleware.trouveService(Autorisation.DROITS_DOSSIER_DECISION_PDF),
    (_requete, reponse) => {
      reponse.sendStatus(200);
    }
  );

  return routes;
};
