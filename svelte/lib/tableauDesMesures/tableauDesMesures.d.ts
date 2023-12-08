declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-mesures': CustomEvent;
  }
}

export type TableauDesMesuresProps = {
  referentielMesuresGenerales: ReferentielMesuresGenerales;
  idService: string;
  categories: Record<string, string>;
  statuts: Record<string, string>;
};

export type ReferentielMesuresGenerales = Record<
  string,
  {
    description: string;
    categorie: string;
    indispensable: boolean;
    descriptionLongue: string;
  }
>;

export type MesureGenerale = {
  statut: string;
  modalites?: string;
};

export type MesureSpecifique = MesureGenerale & {
  categorie: string;
  description: string;
};

export type Mesures = {
  mesuresGenerales: Record<string, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};
