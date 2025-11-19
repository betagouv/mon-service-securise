import * as uuid from 'uuid';
import DescriptionService from './descriptionService.js';
import {
  BrouillonService,
  DonneesBrouillonService,
} from './brouillonService.js';
import { UUID } from '../typesBasiques.js';
import { TypeService } from '../../svelte/lib/creationV2/creationV2.types.js';
import { StatutDeploiement } from '../../donneesReferentielMesuresV2.js';
import PointsAcces from './pointsAcces.js';

const convertisTypesService = (description: DescriptionService) => {
  const typeService: TypeService[] = [];
  const fonctionnalitesV1 = description.fonctionnalites as string[] | undefined;
  const typesServicesV1 = description.typeService as string[] | undefined;
  if (typesServicesV1?.includes('api')) {
    typeService.push('api');
  }
  if (typesServicesV1?.includes('applicationMobile')) {
    typeService.push('applicationMobile');
  }
  if (typesServicesV1?.includes('siteInternet')) {
    if (fonctionnalitesV1?.includes('compte')) {
      typeService.push('serviceEnLigne');
    } else {
      typeService.push('portailInformation');
    }
  }
  return typeService;
};

const convertisStatutDeploiement = (description: DescriptionService) => {
  const correspondanceStatutDeploiement: Record<string, StatutDeploiement> = {
    enProjet: 'enProjet',
    enCours: 'enCours',
    enLigne: 'enLigne',
  };
  return correspondanceStatutDeploiement[
    description.statutDeploiement as string
  ];
};

export const convertisDescriptionV1BrouillonV2 = (
  description: DescriptionService
): BrouillonService => {
  const donnees: DonneesBrouillonService = {
    nomService: description.nomService as string,
    siret: description.organisationResponsable?.siret as string,
    typeService: convertisTypesService(description),
    statutDeploiement: convertisStatutDeploiement(description),
    presentation: description.presentation as string,
    pointsAcces: (description.pointsAcces as PointsAcces).descriptions(),
  };
  if (description.provenanceService === 'achat') {
    donnees.typeHebergement = 'saas';
    donnees.activitesExternalisees = [
      'administrationTechnique',
      'developpementLogiciel',
    ];
  }
  return new BrouillonService(uuid.v4() as UUID, donnees);
};
