import type { Referentiel } from '../ui/types.d';
import type { StatutMesure } from '../modeles/mesure';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-mesure': CustomEvent;
  }
}

export type MesureProps = {
  idService: string;
  categories: Record<string, string>;
  statuts: Record<StatutMesure, string>;
  retoursUtilisateur: Record<string, string>;
  estLectureSeule: boolean;
  mesuresExistantes: MesuresExistantes;
  mesureAEditer?: MesureEditee;
};

export type MesuresExistantes = {
  mesuresGenerales: Record<string, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};

type IdUtilisateur = string;
type PlanAction = {
  priorite?: string;
  echeance?: string;
  responsables?: IdUtilisateur[];
};

export type MesureGenerale = PlanAction & {
  statut?: StatutMesure;
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

export type MesureSpecifique = PlanAction & {
  statut?: StatutMesure;
  modalites?: string;
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

export type ActiviteMesure = {
  type: string;
};
