/* 
  Fichier généré par scripts/moteurRisques/transformeCSVPourSelectionVecteurs.sh
  Ne pas modifier directement
*/

import type { ConfigurationSelectionVecteurs } from './selectionVecteurs.types.js';

export const configurationSelectionVecteurs: ConfigurationSelectionVecteurs = {
  V1: {
    presentInitialement: false,
    regles: {
      specificitesProjet: {
        postesDeTravail: 'Ajouter',
      },
    },
  },
  V2: {
    presentInitialement: true,
    regles: {
      niveauSecurite: {
        niveau1: 'Retirer',
        niveau2: 'Retirer',
      },
      activitesExternalisees: {
        administrationTechnique: 'Retirer',
      },
      typeHebergement: {
        saas: 'Retirer',
      },
    },
  },
  V3: {
    presentInitialement: false,
    regles: {
      activitesExternalisees: {
        administrationTechnique: 'Ajouter',
      },
      typeHebergement: {
        cloud: 'Ajouter',
        saas: 'Ajouter',
      },
    },
  },
  V4: {
    presentInitialement: false,
    regles: {
      ouvertureSysteme: {
        internePlusTiers: 'Ajouter',
        accessibleSurInternet: 'Ajouter',
      },
    },
  },
  V5: {
    presentInitialement: true,
    regles: {},
  },
  V6: {
    presentInitialement: true,
    regles: {
      typeHebergement: {
        saas: 'Retirer',
      },
    },
  },
  V7: {
    presentInitialement: false,
    regles: {
      activitesExternalisees: {
        administrationTechnique: 'Ajouter',
        developpementLogiciel: 'Ajouter',
      },
      typeHebergement: {
        cloud: 'Ajouter',
        saas: 'Ajouter',
      },
    },
  },
  V8: {
    presentInitialement: false,
    regles: {
      typeHebergement: {
        cloud: 'Ajouter',
      },
    },
  },
  V9: {
    presentInitialement: false,
    regles: {
      typeHebergement: {
        saas: 'Ajouter',
      },
    },
  },
  V10: {
    presentInitialement: false,
    regles: {
      niveauSecurite: {
        niveau1: 'Retirer',
      },
      specificitesProjet: {
        accesPhysiqueAuxSallesTechniques: 'Ajouter',
      },
      typeHebergement: {
        cloud: 'Retirer',
        saas: 'Retirer',
      },
    },
  },
  V11: {
    presentInitialement: false,
    regles: {
      typeHebergement: {
        cloud: 'Ajouter',
        saas: 'Ajouter',
      },
    },
  },
  V12: {
    presentInitialement: false,
    regles: {
      niveauSecurite: {
        niveau1: 'Retirer',
      },
      ouvertureSysteme: {
        internePlusTiers: 'Ajouter',
        accessibleSurInternet: 'Ajouter',
      },
    },
  },
  V13: {
    presentInitialement: true,
    regles: {
      activitesExternalisees: {
        developpementLogiciel: 'Retirer',
      },
      typeHebergement: {
        saas: 'Retirer',
      },
    },
  },
  V14: {
    presentInitialement: false,
    regles: {
      activitesExternalisees: {
        developpementLogiciel: 'Ajouter',
      },
      typeHebergement: {
        cloud: 'Ajouter',
        saas: 'Ajouter',
      },
    },
  },
};
