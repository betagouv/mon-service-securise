export type RapportDetaille = {
  statut: 'VALIDE' | 'INVALIDE';
  modelesTeleverses: ModeleTeleverse[];
};

export type ModeleTeleverse = {
  modele: {
    categorie: string;
    description: string;
    descriptionLongue: string;
  };
  erreurs: ErreurModele[];
  numeroLigne: number;
};

export type ErreurModele = 'INTITULE_MANQUANT' | 'CATEGORIE_INCONNUE';
