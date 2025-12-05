import Service from '../service.js';

export const completudeV2 = (service: Service) => {
  const description = service.descriptionService;

  return {
    activitesExternalisees: description.activitesExternalisees,
    specificitesProjet: description.specificitesProjet,
    typeHebergement: description.typeHebergement,
  };
};
