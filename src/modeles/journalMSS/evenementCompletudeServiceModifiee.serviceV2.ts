import Service from '../service.js';

export const completudeV2 = (service: Service) => {
  const description = service.descriptionService;

  return {
    activitesExternalisees: description.activitesExternalisees,
    audienceCible: description.audienceCible,
    dureeDysfonctionnementAcceptable:
      description.dureeDysfonctionnementAcceptable,
    ouvertureSysteme: description.ouvertureSysteme,
    specificitesProjet: description.specificitesProjet,
    typeHebergement: description.typeHebergement,
  };
};
