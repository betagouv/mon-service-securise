declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-decouverte-fonctionnalite': CustomEvent;
  }
}

export type Etape = {
  texte: string;
  action?: 'click' | 'input';
  cibleAction?: HTMLElement;
  donneesAction?: any;
};

export type DecouverteFonctionnaliteProps = {
  cible: HTMLElement;
  etapes: Etape[];
};
