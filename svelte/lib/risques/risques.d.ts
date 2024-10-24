declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques': CustomEvent;
  }
}

export type DonneesRisque = {
  niveauGravite: IdentifiantGravite;
  niveauVraisemblance: IdentifiantVraisemblance;
  id: string;
  commentaire: string;
  intitule: string;
  categories: string[];
  identifiantNumerique: string;
  description: string;
};

export type Risques = {
  risquesGeneraux: DonneesRisque[];
  risquesSpecifiques: DonneesRisque[];
};
export type TypeRisque = 'GENERAL' | 'SPECIFIQUE';
export type Risque = DonneesRisque & { type: TypeRisque };

export type NiveauGravite = {
  position: number;
  description: string;
  descriptionLongue: string;
};

export type NiveauVraisemblance = {
  libelle: string;
  description: string;
  position: number;
};

type RisqueDuReferentiel = {
  categories: string[];
  identifiantNumerique: string;
  description: string;
  descriptionLongue: string;
};

export type IdentifiantGravite = string;

export type IdentifiantVraisemblance = string;

export type ReferentielRisques = Record<string, RisqueDuReferentiel>;

export type ReferentielGravites = Record<IdentifiantGravite, NiveauGravite>;

export type ReferentielCategories = Record<string, string>;

export type ReferentielVraisemblances = Record<
  IdentifiantVraisemblance,
  NiveauVraisemblance
>;

export enum NiveauRisque {
  Faible = 'faible',
  Moyen = 'moyen',
  Eleve = 'eleve',
}

export type ReferentielNiveauxRisque = NiveauRisque[][];

export type RisquesProps = {
  idService: string;
  estLectureSeule: boolean;
  risques: Risques;
  categories: ReferentielCategories;
  niveauxGravite: Record<string, NiveauGravite>;
  referentielRisques: ReferentielRisques;
  niveauxVraisemblance: ReferentielVraisemblances;
  niveauxRisque: ReferentielNiveauxRisque;
};
