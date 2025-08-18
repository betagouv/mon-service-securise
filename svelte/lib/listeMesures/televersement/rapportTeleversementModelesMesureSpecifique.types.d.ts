export type RapportDetaille = {
  statut: 'VALIDE' | 'INVALIDE';
  modelesTeleverses: ModeleTeleverse[];
  depassementDuNombreMaximum: null | {
    nombreMaximum: number;
    nombreTeleverse: number;
  };
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

export type ErreurModele =
  | 'INTITULE_MANQUANT'
  | 'CATEGORIE_INCONNUE'
  | 'MESURE_DUPLIQUEE';

export const MessagesErreur: Record<ErreurModele, string> = {
  INTITULE_MANQUANT: 'Intitulé manquant',
  CATEGORIE_INCONNUE: 'Catégorie inconnue',
  MESURE_DUPLIQUEE: 'Mesure en double',
};
