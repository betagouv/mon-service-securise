import { ConfigurationRisqueV2 } from './risqueV2.js';

export const configurationRisqueV2: ConfigurationRisqueV2 = {
  V1: {
    intitule: 'Un attaquant externe compromet un poste de travail utilisateur',
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
    },
  },
  V2: {
    intitule:
      "Un attaquant externe compromet des ressources d'administration technique interne (poste de travail, réseau, etc.)",
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible un ou plusieurs services du système d'information",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V3: {
    intitule:
      "Un attaquant externe compromet des ressources d'administration technique externe (poste de travail, réseau, etc.)",
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible un ou plusieurs services du système d'information",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V4: {
    intitule:
      'Un attaquant externe exploite une vulnérabilité applicative ou technique',
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible un ou plusieurs services du système d'information",
      OV4: "pour accéder et compromettre les ressources d'envoi de mail afin d'envoyer des mails altérés",
    },
  },
  V5: {
    intitule:
      "Un attaquant externe réalise de l'ingénierie sociale pour récupérer le compte d'un utilisateur",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
    },
  },
  V6: {
    intitule:
      "Un attaquant externe réalise de l'ingénierie sociale pour récupérer le compte d'un acteur interne (utilisateur, admin. tech., hébergeur, etc.) ayant accès aux serveurs ou au code",
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: 'pour rendre indisponible un ou plusieurs services',
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V7: {
    intitule:
      "Un attaquant externe réalise de l'ingénierie sociale pour récupérer le compte d'un acteur externe (utilisateur, admin. tech., hébergeur, etc.) ayant accès aux serveurs ou au code",
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: 'pour rendre indisponible un ou plusieurs services',
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V8: {
    intitule: 'Un attaquant externe compromet le SI du fournisseur PaaS',
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: 'pour rendre indisponible un ou plusieurs services',
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V9: {
    intitule: 'Un attaquant externe compromet le SI du fournisseur SaaS',
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: 'pour rendre indisponible un ou plusieurs services',
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V10: {
    intitule:
      "Un attaquant externe s'introduit physiquement jusqu'aux serveurs hébergés en interne et utilise cet accès physique",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: 'pour rendre indisponible un ou plusieurs services',
    },
  },
  V11: {
    intitule:
      "Un attaquant externe s'introduit physiquement jusqu'aux serveurs hébergés par un fournisseur et utilise cet accès physique",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: 'pour rendre indisponible un ou plusieurs services',
    },
  },
  V12: {
    intitule:
      'Un attaquant externe réalise une attaque par DDoS sur les services exposés',
    intitulesObjectifsVises: {
      OV3: 'pour rendre indisponible un ou plusieurs services',
    },
  },
  V13: {
    intitule:
      'Un attaquant externe compromet des ressources de développement interne',
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible un ou plusieurs services du système d'information",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V14: {
    intitule:
      'Un attaquant externe compromet des ressources de développement externe',
    intitulesObjectifsVises: {
      OV1: "pour défigurer le système d'information",
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible un ou plusieurs services du système d'information",
      OV4: 'pour envoyer des mails altérés',
    },
  },
};
