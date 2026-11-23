import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { Middleware } from '../../http/middleware.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { VersionService } from '../../modeles/versionService.js';
import { AdaptateurPowerpoint } from '../../adaptateurs/adaptateurPowerpoint.interface.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { dateYYYYMMDD } from '../../utilitaires/date.js';
import { donneesSupportCommissionHomologation } from '../../adaptateurs/adaptateurPowerpoint.donnees.js';

const CONTENT_TYPE_PPTX =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export const routesConnecteApiServicePowerpoint = ({
  middleware,
  adaptateurPowerpoint,
  adaptateurHorloge,
}: {
  middleware: Middleware;
  adaptateurPowerpoint: AdaptateurPowerpoint;
  adaptateurHorloge: AdaptateurHorloge;
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/pptx/supportCommissionHomologation.pptx',
    middleware.trouveService(Autorisation.DROITS_DOSSIER_DECISION_PDF),
    async (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      if (service.version() === VersionService.v1) {
        reponse
          .status(422)
          .json({ erreur: { code: 'SERVICE_V1_NON_SUPPORTE' } });
        return;
      }

      const dossierCourant = service.dossierCourant();
      if (!dossierCourant) {
        reponse.status(422).json({ erreur: { code: 'AUCUN_DOSSIER_COURANT' } });
        return;
      }

      const maintenant = adaptateurHorloge.maintenant();
      const support =
        await adaptateurPowerpoint.genereSupportCommissionHomologation({
          ...donneesSupportCommissionHomologation(service),
          dateCreation: maintenant,
        });
      const dateDuJour = dateYYYYMMDD(maintenant);
      reponse
        .attachment(`MSS_support_commission_homologation_${dateDuJour}.pptx`)
        .contentType(CONTENT_TYPE_PPTX)
        .send(support);
    }
  );

  return routes;
};
