import * as uuid from 'uuid';
import DescriptionService from './descriptionService.js';
import { BrouillonService } from './brouillonService.js';
import { UUID } from '../typesBasiques.js';
import { TypeService } from '../../svelte/lib/creationV2/creationV2.types.js';

function convertisTypesService(description: DescriptionService) {
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
}

export const convertisDescriptionV1BrouillonV2 = (
  description: DescriptionService
): BrouillonService =>
  new BrouillonService(uuid.v4() as UUID, {
    nomService: description.nomService as string,
    siret: description.organisationResponsable?.siret as string,
    typeService: convertisTypesService(description),
  });
