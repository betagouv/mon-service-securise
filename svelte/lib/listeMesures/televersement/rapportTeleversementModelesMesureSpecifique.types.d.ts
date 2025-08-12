export type RapportDetaille = {
  modelesTeleverses: {
    modele: {
      categorie: string;
      description: string;
      decriptionLongue: string;
    };
    erreurs: ErreurModele[];
  }[];
};

export type ErreurModele = 'INTITULE_MANQUANT' | 'CATEGORIE_INCONNUE';
