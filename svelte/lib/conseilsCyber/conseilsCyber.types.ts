declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-conseils-cyber': CustomEvent;
  }
}

export type ConseilsCyberProps = {
  donneesArticles: {
    idCategorie: string;
    titre: string;
    href: string;
  }[];
  categories: Record<string, { label: string; accent: string }>;
  sectionSelectionnee: string;
};
