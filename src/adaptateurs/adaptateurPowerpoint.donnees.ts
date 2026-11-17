import Service from '../modeles/service.js';
import Dossier from '../modeles/dossier.js';
import { AutoriteHomologation } from './adaptateurPowerpoint.interface.js';
import { piecesDuDossier } from '../modeles/objetsPowerpoint/piecesDuDossier.js';
import { contexteDuService } from '../modeles/objetsPowerpoint/contexteDuService.js';
import { besoinsDeSecurite } from '../modeles/objetsPowerpoint/besoinsDeSecurite.js';
import { cartographiesDesRisques } from '../modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { indiceCyber } from '../modeles/objetsPowerpoint/indiceCyber.js';
import { statistiquesDesMesures } from '../modeles/objetsPowerpoint/statistiquesDesMesures.js';
import { exigencesRestantes } from '../modeles/objetsPowerpoint/exigencesRestantes.js';
import { avisDesMembres } from '../modeles/objetsPowerpoint/avisDesMembres.js';
import { DescriptionServiceV2 } from '../modeles/descriptionServiceV2.js';
import { annexeDesMesures } from '../modeles/objetsPowerpoint/annexeDesMesures.js';

const autoriteHomologation = ({
  autorite,
}: Dossier): AutoriteHomologation | undefined =>
  autorite.estComplete()
    ? { nom: autorite.nom!, fonction: autorite.fonction! }
    : undefined;

export const donneesSupportCommissionHomologation = (service: Service) => {
  const dossierCourant = service.dossierCourant();
  const descriptionService = service.descriptionService as DescriptionServiceV2;
  return {
    autorite: autoriteHomologation(dossierCourant),
    piecesDuDossier: piecesDuDossier(dossierCourant),
    contexte: contexteDuService(descriptionService),
    besoinsDeSecurite: besoinsDeSecurite(descriptionService),
    cartographiesDesRisques: cartographiesDesRisques(service.risquesV2!),
    indiceCyber: indiceCyber(service),
    statistiquesDesMesures: statistiquesDesMesures(service),
    exigencesRestantes: exigencesRestantes(service),
    avisDesMembres: avisDesMembres(dossierCourant, service.referentiel),
    annexeDesMesures: annexeDesMesures(service),
  };
};
