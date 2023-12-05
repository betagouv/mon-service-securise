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
};

export type MesuresExistantes = {
  mesuresGenerales: Record<string, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};

export type MesureGenerale = {
  statut: string;
  modalites?: string;
};

export type MesureSpecifique = MesureGenerale & {
  categorie: string;
  description: string;
};
