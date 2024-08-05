declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-blog': CustomEvent;
  }
}

export type BlogProps = {
  sections: Section[];
};

export type Section = {
  id: string;
  nom: string;
};
