import type { Risque, TousRisques } from './risquesV2';

const r2: Risque = {
  id: 'R2',
  intitule:
    "Compromission de ressources d'administration internes pour récupérer ou falsifier des informations et pour rendre indisponible l'activité du service",
  description:
    "Pour atteindre son objectif visé, un attaquant externe va compromettre une ressource utilisée pour l'administration technique interne.",
  exemple:
    "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre : <br>- un poste de travail d'administrateur technique,<br>- le réseau d'administration technique.",
  gravite: 1,
  graviteCalculee: 1,
  vraisemblance: 4,
  categories: ['confidentialite', 'integrite', 'disponibilite'],
  mesuresAssociees: ['MCO_MCS.1', 'MCO_MCS.17', 'MCO_MCS.3', 'MCO_MCS.4'],
};

const r4: Risque = {
  id: 'R4',
  intitule:
    "Compromission d'un service ou d'un serveur exposé pour récupérer ou falsifier des informations et pour rendre indisponible l'activité du service",
  description:
    'Pour atteindre son objectif visé, un attaquant externe va compromettre un service ou serveur exposé.',
  exemple:
    'Par exemple, pour atteindre son objectif un attaquant externe peut exploiter une vulnérabilité applicative ou technique sur un serveur web exposé ou une API.',
  gravite: 1,
  graviteCalculee: 1,
  vraisemblance: 4,
  categories: ['confidentialite', 'integrite', 'disponibilite'],
  desactive: false,
  mesuresAssociees: ['MCO_MCS.1', 'MCO_MCS.17', 'MCO_MCS.5', 'SUPERVISION.7'],
};

const r5: Risque = {
  id: 'R5',
  intitule:
    "Compromission d'un compte utilisateur pour récupérer ou falsifier des informations",
  description:
    "Pour atteindre son objectif visé, un attaquant externe va compromettre un compte utilisateur par ingénierie sociale ou en exploitant une faiblesse dans l'authentification.",
  exemple:
    "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre un compte via : <br>- de l'ingénierie sociale (ex. hameçonnage), <br>- une attaque par force brute sur le mécanisme d'authentification (ex. attaque par force brute ou par saisie d’authentifiants volés).",
  gravite: 1,
  graviteCalculee: 1,
  vraisemblance: 4,
  categories: ['confidentialite', 'integrite'],
  desactive: false,
  mesuresAssociees: ['RH.2', 'DISTANCE.2'],
};

const r6: Risque = {
  id: 'R6',
  intitule:
    "Compromission d'un compte d'un acteur technique interne pour récupérer ou falsifier des informations et pour rendre indisponible l'activité du service",
  description:
    "Pour atteindre son objectif visé, un attaquant externe va compromettre un compte d'un acteur technique interne (ex. administrateur, hébergeur, développeur) par ingénierie sociale ou en exploitant une faiblesse dans l'authentification.",
  exemple:
    "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre un compte via : <br>- de l'ingénierie sociale (ex. hameçonnage), <br>- une attaque par force brute sur le mécanisme d'authentification (ex. attaque par force brute ou par saisie d’authentifiants volés).",
  gravite: 1,
  graviteCalculee: 1,
  vraisemblance: 4,
  categories: ['confidentialite', 'integrite', 'disponibilite'],
  mesuresAssociees: ['RH.2', 'DISTANCE.2', 'SUPERVISION.7'],
};

const r12: Risque = {
  id: 'R12',
  intitule:
    "Attaque DDoS sur un service exposé pour rendre indisponible l'activité du service",
  description:
    'Pour atteindre son objectif visé, un attaquant externe va réaliser une attaque par déni de service distribué (DDoS).',
  exemple:
    "Par exemple, pour atteindre son objectif un attaquant externe peut saturer les services exposés (serveur web, API) via l'envoi d'un volume massif de requêtes depuis un réseau de machines compromises.",
  gravite: 1,
  graviteCalculee: 1,
  vraisemblance: 4,
  categories: ['disponibilite'],
  mesuresAssociees: ['CLOISON.4', 'FILTRE.1', 'SUPERVISION.7'],
};

const r13: Risque = {
  id: 'R13',
  intitule:
    "Compromission de ressources de développement internes pour récupérer ou falsifier des informations et pour rendre indisponible l'activité du service",
  description:
    'Pour atteindre son objectif visé, un attaquant externe va compromettre une ressource interne (ex. CI/CD) utilisée pour le développement.',
  exemple:
    "Par exemple, pour atteindre son objectif un attaquant externe peut compromettre :<br>- la chaîne d'intégration et de déploiement (CI/CD),<br>- un dépôt de code source.",
  gravite: 1,
  graviteCalculee: 1,
  vraisemblance: 4,
  categories: ['confidentialite', 'integrite', 'disponibilite'],
  mesuresAssociees: ['DEV.1', 'AUDIT.6', 'AUDIT.2'],
};

const risquesDeLaVisite = [r2, r4, r5, r6, r12, r13];

const risques: TousRisques = {
  risques: risquesDeLaVisite,
  risquesBruts: risquesDeLaVisite,
  risquesCibles: risquesDeLaVisite,
  risquesSpecifiques: [
    {
      id: 'a99aa881-0c03-4a7b-90b3-0b908a33d727',
      intitule: 'Un risque spé',
      identifiantNumerique: 'RS1',
      description: '',
      categories: ['disponibilite'],
      gravite: 1,
      vraisemblance: 1,
      graviteBrute: 1,
      vraisemblanceBrute: 1,
      commentaire: 'efazf',
    },
  ],
};

export const donneesVisiteGuidee = { risques };
