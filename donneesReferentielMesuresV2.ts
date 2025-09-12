export const mesuresV2 = {
  'RECENSEMENT.1': {
    description:
      "Etablir la liste de l'ensemble des activités, services et/ou données à protéger",
    categorie: 'gouvernance',
    referentiel: 'ANSSI',
  },
  'RECENSEMENT.2': {
    description:
      'Etablir et tenir à jour la liste des équipements et des applicatifs contribuant au fonctionnement du système',
    categorie: 'gouvernance',
    referentiel: 'ANSSI',
  },
};

export const questionsV2 = {
  categorieDonneesTraitees: {
    donneesSensibles: {
      nom: 'Données sensibles',
      exemple: 'Santé, appartenance syndicale, etc.',
    },
    documentsRHSensibles: {
      nom: 'Documents RH sensibles',
      exemple: 'évaluations, sanctions, fiches de paye, RIB, IBAN, etc.',
    },
  },
  volumetrieDonneesTraitees: {
    faible: {
      nom: 'Faible',
      description:
        "Le système stocke une quantité limitée et stable d'informations, facile à gérer et rapidement consultable.",
    },
    moyen: {
      nom: 'Moyen',
      description:
        "Le système stocke un volume conséquent et stable d'informations, qui commence à nécessiter une organisation ou des outils spécifiques.",
    },
    eleve: {
      nom: 'Elevé',
      description:
        "Le système stocke un grand et stable nombre d'informations, avec un impact notable sur la gestion, la sauvegarde ou l'accessibilité.",
    },
    tresEleve: {
      nom: 'Très élevé',
      description:
        'Le système stocke une très grande quantité d’informations, en croissance constante, nécessitant des capacités de stockage importantes.',
    },
  },
};

export type CategorieDonneesTraitees =
  keyof typeof questionsV2.categorieDonneesTraitees;
export type VolumetrieDonneesTraitees =
  keyof typeof questionsV2.volumetrieDonneesTraitees;
