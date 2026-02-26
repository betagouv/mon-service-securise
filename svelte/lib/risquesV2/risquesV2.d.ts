declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques-v2': CustomEvent;
  }
}

type Niveau = 1 | 2 | 3 | 4;

export type RisqueGeneral = {
  id: string;
  intitule: string;
  categories: string[];
  gravite: Niveau;
  vraisemblance: Niveau;
  type: 'GENERAL';
};

export type RisqueSpecifique = {
  id: string;
  intitule: string;
  categories: string[];
  commentaire: string;
  description: string;
  identifiantNumerique: string;
  gravite: Niveau;
  vraisemblance: Niveau;
  niveauRisque: string;
  type: 'SPECIFIQUE';
};

export type TousRisques = {
  risquesBruts: RisqueGeneral[];
  risques: RisqueGeneral[];
  risquesCibles: RisqueGeneral[];
  risquesSpecifiques: RisqueSpecifique[];
};

export type RisquesV2Props = {
  idService: string;
};
