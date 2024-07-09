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
  titreNiveau: string;
  resume: string;
  description: {
    exemplesServicesNumeriques: string[];
    demarcheIndicative: string;
    evalutationBesoins?: string;
    securisation: string[];
    homologation: string[];
  };
};

export const ordreDesNiveaux: Record<IdNiveauDeSecurite, number> = {
  niveau1: 1,
  niveau2: 2,
  niveau3: 3,
};
