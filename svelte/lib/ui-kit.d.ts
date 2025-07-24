import { DOMAttributes, type HTMLAttributes } from 'svelte/elements';

declare namespace svelteHTML {
  interface IntrinsicElements {
    'lab-anssi-bouton': HTMLAttributes<HTMLButtonElement> & {
      variante: 'primaire' | 'tertiaire' | 'tertiaire-sans-bordure';
      taille: 'sm' | 'md' | 'lg';
      titre: string;
      icone?: string;
      'position-icone'?: 'sans' | 'seule' | 'droite' | 'gauche';
      actif: boolean;
    };
  }
}
