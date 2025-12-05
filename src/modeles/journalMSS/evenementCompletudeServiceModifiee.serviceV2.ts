import Service from '../service.js';
import { DescriptionServiceV2 } from '../descriptionServiceV2.js';

export const completudeV2 = (service: Service) => {
  const description = service.descriptionService as DescriptionServiceV2;

  return {
    activitesExternalisees: description.activitesExternalisees,
    audienceCible: description.audienceCible,
    categoriesDonneesTraitees: description.categoriesDonneesTraitees,
    categoriesDonneesTraiteesSupplementaires:
      description.categoriesDonneesTraiteesSupplementaires?.length,
    dureeDysfonctionnementAcceptable:
      description.dureeDysfonctionnementAcceptable,
    ouvertureSysteme: description.ouvertureSysteme,
    specificitesProjet: description.specificitesProjet,
    typeHebergement: description.typeHebergement,
  };
};
