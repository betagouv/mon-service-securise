declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques-v2': CustomEvent;
  }
}

type Niveau = 1 | 2 | 3 | 4;

export type Risque = {
  id: string;
  intitule: string;
  categories: string[];
  gravite: Niveau;
  vraisemblance: Niveau;
};

export type TousRisques = {
  risquesBruts: Risque[];
  risques: Risque[];
  risquesCibles: Risque[];
};

export type RisquesV2Props = {
  idService: string;
};
