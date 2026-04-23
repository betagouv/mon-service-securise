declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-supervision': CustomEvent;
  }
}

export type SupervisionProps = {
  optionsFiltrageDate: Record<string, string>;
  entitesSupervisees: EntiteSupervisee[];
};

export type EntiteSupervisee = {
  nom: string;
  departement: string;
  siret: string;
};
