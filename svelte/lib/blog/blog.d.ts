declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-blog': CustomEvent;
  }
}

export type BlogProps = {
  sections: Section[];
  articles: Article[];
};

export type Section = {
  id: string;
  nom: string;
};

export type Article = {
  id: string;
  titre: string;
  url?: string;
  section: Section;
};
