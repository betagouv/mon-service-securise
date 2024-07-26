import type { Referentiel } from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-mesure': CustomEvent;
  }
}

export type MesureProps = {
  idService: string;
  categories: Record<string, string>;
  statuts: Record<string, string>;
  retoursUtilisateur: Record<string, string>;
  estLectureSeule: boolean;
  mesuresExistantes: MesuresExistantes;
  mesureAEditer?: MesureEditee;
};

export type MesuresExistantes = {
  mesuresGenerales: Record<string, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};

export type MesureGenerale = {
  statut?: string;
  modalites?: string;
};

export type MesureGeneraleEnrichie = MesureGenerale & {
  description: string;
  descriptionLongue: string;
  categorie: string;
  indispensable?: boolean;
  referentiel: Referentiel;
  identifiantNumerique: string;
  lienBlog?: string;
};

export type MesureSpecifique = MesureGenerale & {
  categorie: string;
  description: string;
  identifiantNumerique: string;
};

export type MesureEditee = {
  mesure: MesureSpecifique | MesureGeneraleEnrichie;
  metadonnees: {
    typeMesure: 'GENERALE' | 'SPECIFIQUE';
    idMesure: string | number;
  };
};
