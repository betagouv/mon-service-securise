declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-mesures': CustomEvent;
  }
}

export type IdService = string;

export type TableauDesMesuresProps = {
  idService: IdService;
  categories: Record<string, string>;
  statuts: Record<string, string>;
};

export type MesureGenerale = {
  description: string;
  categorie: string;
  indispensable: boolean;
  descriptionLongue: string;
  statut?: string;
  modalites?: string;
};

export type MesureSpecifique = {
  categorie: string;
  description: string;
  statut: string;
  modalites: string;
};

export type Mesures = {
  mesuresGenerales: Record<string, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};
