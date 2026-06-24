/* 
Fichier généré par scripts/moteurRisques/transformeCSVIntituleRisque.sh
Ne pas modifier directement
*/

import { ConfigurationRisqueV2 } from './risquesV2.types.js';

export const configurationRisqueV2: ConfigurationRisqueV2 = {
  V1: {
    intitule: "Compromission d'un poste de travail utilisateur",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
    },
  },
  V2: {
    intitule: "Compromission de ressources d'administration internes",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V3: {
    intitule: "Compromission de ressources d'administration externes",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V4: {
    intitule: "Compromission d'un service ou d'un serveur exposé",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V5: {
    intitule: "Compromission d'un compte utilisateur",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
    },
  },
  V6: {
    intitule: "Compromission d'un compte d'un acteur technique interne",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V7: {
    intitule: "Compromission d'un compte d'un acteur technique externe",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V8: {
    intitule: 'Compromission du SI du fournisseur PaaS',
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V9: {
    intitule: 'Compromission du SI du fournisseur SaaS',
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V10: {
    intitule: 'Intrusion physique dans un local interne',
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
    },
  },
  V11: {
    intitule: 'Intrusion physique dans un local externe',
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
    },
  },
  V12: {
    intitule: 'Attaque DDoS sur un service exposé',
    intitulesObjectifsVises: {
      OV3: "pour rendre indisponible l'activité du service",
    },
  },
  V13: {
    intitule: 'Compromission de ressources de développement internes',
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V14: {
    intitule: 'Compromission de ressources de développement externes',
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
};
