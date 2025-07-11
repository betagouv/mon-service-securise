import type { IdNiveauDeSecurite } from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-niveaux-de-securite': CustomEvent;
  }
}

export type NiveauxDeSecuriteProps = {
  idService: string;
  niveauDeSecuriteMinimal: IdNiveauDeSecurite;
  niveauSecuriteExistant?: IdNiveauDeSecurite;
  lectureSeule: boolean;
  avecSuggestionBesoinsSecuriteRetrogrades: boolean;
  modeVisiteGuidee: boolean;
};

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
