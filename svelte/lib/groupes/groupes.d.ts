declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-groupes': CustomEvent;
  }
}

export type Groupe = {
  id: string;
  libelle: string;
  idServicesAssocies: string[];
};

export type GroupesProps = {};
