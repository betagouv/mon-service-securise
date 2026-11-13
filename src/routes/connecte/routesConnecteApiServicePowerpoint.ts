import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { VersionService } from '../../modeles/versionService.js';
import {
  AdaptateurPowerpoint,
  AutoriteHomologation,
} from '../../adaptateurs/adaptateurPowerpoint.interface.js';
import Dossier from '../../modeles/dossier.js';
import { piecesDuDossier } from '../../modeles/objetsPowerpoint/piecesDuDossier.js';
import { contexteDuService } from '../../modeles/objetsPowerpoint/contexteDuService.js';
import { besoinsDeSecurite } from '../../modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { cartographiesDesRisques } from '../../modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { indiceCyber } from '../../modeles/objetsPowerpoint/indiceCyber.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { dateYYYYMMDD } from '../../utilitaires/date.js';

const CONTENT_TYPE_PPTX =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

const autoriteHomologation = ({
  autorite,
}: Dossier): AutoriteHomologation | undefined =>
  autorite.estComplete()
    ? { nom: autorite.nom!, fonction: autorite.fonction! }
    : undefined;

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

      const descriptionService =
        service.descriptionService as DescriptionServiceV2;
      const maintenant = adaptateurHorloge.maintenant();
      const support =
        await adaptateurPowerpoint.genereSupportCommissionHomologation({
          dateCreation: maintenant,
          autorite: autoriteHomologation(dossierCourant),
          piecesDuDossier: piecesDuDossier(dossierCourant),
          contexte: contexteDuService(descriptionService),
          besoinsDeSecurite: besoinsDeSecurite(descriptionService),
          cartographiesDesRisques: cartographiesDesRisques(service.risquesV2!),
          indiceCyber: indiceCyber(service),
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
