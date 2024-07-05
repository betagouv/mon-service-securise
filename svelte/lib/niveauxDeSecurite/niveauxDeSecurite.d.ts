declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-niveaux-de-securite': CustomEvent;
  }
}

export type NiveauxDeSecuriteProps = {
  niveauDeSecuriteMinimal: IdNiveauDeSecurite;
};

export type IdNiveauDeSecurite = 'niveau1' | 'niveau2' | 'niveau3';

export type NiveauDeSecurite = {
  id: IdNiveauDeSecurite;
  nom: string;
  resume: string;
};
