import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { VersionService } from '../../modeles/versionService.js';

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
    (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      if (service.version() === VersionService.v1) {
        reponse
          .status(422)
          .json({ erreur: { code: 'SERVICE_V1_NON_SUPPORTE' } });
        return;
      }

      reponse.sendStatus(200);
    }
  );

  return routes;
};
