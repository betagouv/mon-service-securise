declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques': CustomEvent;
  }
}

export type DonneesRisque = {
  niveauGravite: string;
  id: string;
  commentaire: string;
  intitule: string;
  categories: string[];
  identifiantNumerique: string;
};

export type Risques = {
  risquesGeneraux: DonneesRisque[];
  risquesSpecifiques: DonneesRisque[];
};
export type TypeRisque = 'GENERAL' | 'SPECIFIQUE';
export type Risque = DonneesRisque & { type: TypeRisque };

export type NiveauGravite = {
  position: number;
};

export type RisquesProps = {
  idService: string;
  estLectureSeule: boolean;
  risques: Risques;
  categories: Record<string, string>;
  niveauxGravite: Record<string, NiveauGravite>;
};
