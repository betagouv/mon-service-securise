declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-mesure': CustomEvent;
  }
}

export type MesureProps = {
  idService: string;
  categories: Record<string, string>;
  statuts: Record<string, string>;
  mesuresExistantes: MesuresExistantes;
  mesureAEditer?: MesureEditee;
};

export type MesuresExistantes = {
  mesuresGenerales: Record<string, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};

export type MesureGenerale = {
  statut: string;
  modalites?: string;
};

export type MesureGeneraleEnrichie = MesureGenerale & {
  description: string;
  descriptionLongue: string;
  categorie: string;
  indispensable?: boolean;
};

export type MesureSpecifique = MesureGenerale & {
  categorie: string;
  description: string;
};

export type MesureEditee = {
  mesure: MesureSpecifique | MesureGeneraleEnrichie;
  metadonnees: {
    typeMesure: 'GENERALE' | 'SPECIFIQUE';
    idMesure: string | number;
  };
};
