import type { NiveauSecuriteService } from './tableauDeBord.d';

export const donneesVisiteGuidee = {
  resume: {
    nombreServices: 1,
    nombreServicesHomologues: 0,
    nombreHomologationsExpirees: 0,
  },
  indiceCyber: 4.3,
  services: [
    {
      id: 'ID-SERVICE-VISITE-GUIDEE',
      nomService: 'MonServiceSécurisé',
      organisationResponsable: 'ANSSI',
      contributeurs: [],
      statutHomologation: {
        id: 'activee',
        enCoursEdition: false,
        libelle: 'Active',
        ordre: 5,
      },
      nombreContributeurs: 3,
      estProprietaire: true,
      estAdmin: false,
      documentsPdfDisponibles: ['annexes', 'syntheseSecurite'],
      permissions: {
        gestionContributeurs: true,
      },
      aUneSuggestionAction: false,
      actionRecommandee: undefined,
      niveauSecurite: 'niveau1' as NiveauSecuriteService,
      pourcentageCompletude: 0.5,
    },
  ],
  indicesCyber: [{ id: 'ID-SERVICE-VISITE-GUIDEE', indiceCyber: '4.3' }],
};
