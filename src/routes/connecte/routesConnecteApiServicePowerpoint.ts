import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { VersionService } from '../../modeles/versionService.js';
import { AdaptateurPowerpoint } from '../../adaptateurs/adaptateurPowerpoint.interface.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { dateYYYYMMDD } from '../../utilitaires/date.js';

const CONTENT_TYPE_PPTX =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export const routesConnecteApiServicePowerpoint = ({
  middleware,
  adaptateurEnvironnement,
  adaptateurPowerpoint,
  adaptateurHorloge,
}: {
  middleware: Middleware;
  adaptateurEnvironnement: AdaptateurEnvironnement;
  adaptateurPowerpoint: AdaptateurPowerpoint;
  adaptateurHorloge: AdaptateurHorloge;
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
    async (requete, reponse, suite) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      if (service.version() === VersionService.v1) {
        reponse
          .status(422)
          .json({ erreur: { code: 'SERVICE_V1_NON_SUPPORTE' } });
        return;
      }

      try {
        const maintenant = adaptateurHorloge.maintenant();
        const support =
          await adaptateurPowerpoint.genereSupportCommissionHomologation({
            nomService: service.nomService(),
            dateCreation: maintenant,
          });
        const dateDuJour = dateYYYYMMDD(maintenant);
        reponse
          .attachment(`MSS_support_commission_homologation_${dateDuJour}.pptx`)
          .contentType(CONTENT_TYPE_PPTX)
          .send(support);
      } catch (erreur) {
        suite(erreur);
      }
    }
  );

  return routes;
};
