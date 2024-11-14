declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-supervision': CustomEvent;
  }
}

export type SupervisionProps = {
  optionsFiltrageDate: Record<string, string>;
};
