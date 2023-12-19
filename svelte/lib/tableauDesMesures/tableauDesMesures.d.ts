declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-mesures': CustomEvent;
  }
}

export type IdService = string;
export type IdCategorie = string;
export type IdStatut = string;

export type TableauDesMesuresProps = {
  idService: IdService;
  categories: Record<IdCategorie, string>;
  statuts: Record<IdStatut, string>;
  estLectureSeule: boolean;
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

export type IdMesureGenerale = string;
export type Mesures = {
  mesuresGenerales: Record<IdMesureGenerale, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};
