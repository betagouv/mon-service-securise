/* 
  Fichier généré par scripts/moteurRisques/transformeCSVIntituleRisque.sh
  Ne pas modifier directement
*/

import { ConfigurationRisqueV2 } from './risquesV2.types.js';

export const configurationRisqueV2: ConfigurationRisqueV2 = {
  V1: {
    intitule: "Compromission d'un poste de travail utilisateur",
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre le poste de travail d'un utilisateur du service.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre un poste de travail via : <br>- l'exploitation d'une vulnérabilité liée à l'OS ou un applicatif sur le poste de travail utilisateur,<br>- l'installation d'un malware sur le poste de travail utilisateur,<br>- le vol du poste de travail de l'utilisateur.",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
    },
  },
  V2: {
    intitule: "Compromission de ressources d'administration internes",
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre une ressource utilisée pour l'administration technique interne.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre : <br>- un poste de travail d'administrateur technique,<br>- le réseau d'administration technique.",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V3: {
    intitule: "Compromission de ressources d'administration externes",
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre une ressource utilisée pour l'administration technique externe (ex. infogérant)",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre : <br>- un poste de travail d'administrateur technique,<br>- le réseau d'administration technique.",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V4: {
    intitule: "Compromission d'un service ou d'un serveur exposé",
    description:
      'Pour atteindre son objectif visé, un attaquant externe va compromettre un service ou serveur exposé.',
    exemple:
      'Par exemple, pour atteindre son objectif un attaquant externe peut exploiter une vulnérabilité applicative ou technique sur un serveur web exposé ou une API.',
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V5: {
    intitule: "Compromission d'un compte utilisateur",
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre un compte utilisateur par ingénierie sociale ou en exploitant une faiblesse dans l'authentification.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre un compte via : <br>- de l'ingénierie sociale (ex. hameçonnage), <br>- une attaque par force brute sur le mécanisme d'authentification (ex. attaque par force brute ou par saisie d’authentifiants volés).",
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
    },
  },
  V6: {
    intitule: "Compromission d'un compte d'un acteur technique interne",
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre un compte d'un acteur technique interne (ex. administrateur, hébergeur, développeur) par ingénierie sociale ou en exploitant une faiblesse dans l'authentification.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre un compte via : <br>- de l'ingénierie sociale (ex. hameçonnage), <br>- une attaque par force brute sur le mécanisme d'authentification (ex. attaque par force brute ou par saisie d’authentifiants volés).",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V7: {
    intitule: "Compromission d'un compte d'un acteur technique externe",
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre un compte d'un acteur technique externe (ex. administrateur, hébergeur, développeur) par ingénierie sociale ou en exploitant une faiblesse dans l'authentification.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre un compte via : <br>- de l'ingénierie sociale (ex. hameçonnage), <br>- une attaque par force brute sur le mécanisme d'authentification (ex. attaque par force brute ou par saisie d’authentifiants volés).",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V8: {
    intitule: 'Compromission du SI du fournisseur PaaS',
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre l'environnement fourni par le prestataire de PaaS.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre l'environnement fourni par le prestataire de PaaS via :<br>- l'exploitation d'une vulnérabilité de la plateforme PaaS,<br>- l'exploitation d'un défaut de cloisonnement entre les environnements hébergés.",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V9: {
    intitule: 'Compromission du SI du fournisseur SaaS',
    description:
      "Pour atteindre son objectif visé, un attaquant externe va compromettre l'environnement fourni par le prestataire de SaaS.",
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre l'environnement fourni par le prestataire de SaaS via :<br>- l'exploitation d'une vulnérabilité de la solution SaaS,<br>- l'exploitation d'un défaut de cloisonnement entre les données des clients hébergés.",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V10: {
    intitule: 'Intrusion physique dans un local interne',
    description:
      "Pour atteindre son objectif visé, un attaquant externe va s'introduire physiquement dans les locaux techniques internes.",
    exemple:
      'Par exemple, pour atteindre son objectif un attaquant externe peut, une fois introduit dans les locaux techniques :<br>- accéder physiquement aux serveurs hébergés,<br>- dérober ou détériorer un équipement contenant des données.',
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
    },
  },
  V11: {
    intitule: 'Intrusion physique dans un local externe',
    description:
      "Pour atteindre son objectif visé, un attaquant externe va s'introduire physiquement dans les locaux techniques externes.",
    exemple:
      'Par exemple, pour atteindre son objectif un attaquant externe peut, une fois introduit dans les locaux techniques :<br>- accéder physiquement aux serveurs hébergés,<br>- dérober ou détériorer un équipement contenant des données.',
    intitulesObjectifsVises: {
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
    },
  },
  V12: {
    intitule: 'Attaque DDoS sur un service exposé',
    description:
      'Pour atteindre son objectif visé, un attaquant externe va réaliser une attaque par déni de service distribué (DDoS).',
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut saturer les services exposés (serveur web, API) via l'envoi d'un volume massif de requêtes depuis un réseau de machines compromises.",
    intitulesObjectifsVises: {
      OV3: "pour rendre indisponible l'activité du service",
    },
  },
  V13: {
    intitule: 'Compromission de ressources de développement internes',
    description:
      'Pour atteindre son objectif visé, un attaquant externe va compromettre une ressource interne (ex. CI/CD) utilisée pour le développement.',
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre :<br>- la chaîne d'intégration et de déploiement (CI/CD),<br>- un dépôt de code source.",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
  V14: {
    intitule: 'Compromission de ressources de développement externes',
    description:
      'Pour atteindre son objectif visé, un attaquant externe va compromettre une ressource externe (ex. CI/CD) utilisée pour le développement.',
    exemple:
      "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre :<br>- la chaîne d'intégration et de déploiement (CI/CD),<br>- un dépôt de code source.",
    intitulesObjectifsVises: {
      OV1: 'pour défigurer le service',
      OV2: 'pour récupérer ou falsifier des informations',
      OV3: "pour rendre indisponible l'activité du service",
      OV4: 'pour envoyer des mails altérés',
    },
  },
};
