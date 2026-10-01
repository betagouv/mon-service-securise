declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-groupes': CustomEvent;
  }
}

export type Groupe = {
  id: string;
  libelle: string;
};

export type GroupesProps = {
  groupes: Groupe[];
};
