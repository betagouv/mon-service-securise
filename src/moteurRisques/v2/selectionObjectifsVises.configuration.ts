import type { ConfigurationSelectionObjectifsVises } from './selectionObjectifsVises.types.js';

export const configurationSelectionObjectifsVises: ConfigurationSelectionObjectifsVises =
  {
    OV1: {
      presentInitialement: false,
      regles: {
        typeService: {
          portailInformation: 'Ajouter',
          serviceEnLigne: 'Ajouter',
        },
      },
    },
    OV2: {
      presentInitialement: true,
      regles: {},
    },
    OV3: {
      presentInitialement: true,
      regles: {},
    },
    OV4: {
      presentInitialement: false,
      regles: {
        specificitesProjet: {
          echangeOuReceptionEmails: 'Ajouter',
        },
      },
    },
  };
