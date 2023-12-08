declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-mesures': CustomEvent;
  }
}

export type TableauDesMesuresProps = {
  mesures: Mesures;
  referentielMesuresGenerales: ReferentielMesuresGenerales;
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
  id: string;
  statut: string;
  modalites?: string;
};

export type MesureSpecifique = Omit<MesureGenerale, 'id'> & {
  categorie: string;
  description: string;
};

export type Mesures = {
  mesuresGenerales: MesureGenerale[];
  mesuresSpecifiques: MesureSpecifique[];
};
