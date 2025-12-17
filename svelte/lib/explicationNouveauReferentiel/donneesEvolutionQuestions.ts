type EvolutionQuestion = {
  label: string;
  statut: '🆕 Ajoutée' | '✏️ Modifiée';
};

export const donneesEvolutionQuestions: EvolutionQuestion[] = [
  {
    label: "Le projet inclut-il l'une des spécificités suivantes ?",
    statut: '🆕 Ajoutée',
  },
  { statut: '🆕 Ajoutée', label: 'Comment le système est-il hébergé ?' },
  {
    statut: '🆕 Ajoutée',
    label: 'Quelles activités du projet sont entièrement externalisées ?',
  },
  { statut: '🆕 Ajoutée', label: "Quelle est l'ouverture du système ?" },
  { statut: '🆕 Ajoutée', label: "Quelle est l'audience cible du projet ?" },
  {
    statut: '🆕 Ajoutée',
    label:
      'Quel est le volume des données indiquées au dessus traitées au sein du SI ?',
  },
  { statut: '✏️ Modifiée', label: 'Nom du projet à sécuriser' },
  {
    statut: '✏️ Modifiée',
    label: "Nom ou SIRET de l'organisation responsable du projet",
  },
  { statut: '✏️ Modifiée', label: 'Quel est le type de projet à sécuriser ?' },
  { statut: '✏️ Modifiée', label: 'Présentation succinte' },
  { statut: '✏️ Modifiée', label: "Modalités d'accès" },
  { statut: '✏️ Modifiée', label: 'Quelles données sont traitées ?' },
  { statut: '✏️ Modifiée', label: 'Où sont localisées les données traitées ?' },
  {
    statut: '✏️ Modifiée',
    label:
      'Quelle serait la durée maximale acceptable de dysfonctionnement du système ?',
  },
];
