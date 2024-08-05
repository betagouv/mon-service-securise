declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-blog': CustomEvent;
  }
}

export type BlogProps = {
  sections: Section[];
  articles: Article[];
};

export type IdSection = string;

export type Section = {
  id: IdSection;
  nom: string;
};

export type Article = {
  id: string;
  titre: string;
  url?: string;
  section: Section;
};
