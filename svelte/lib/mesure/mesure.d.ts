import type { PrioriteMesure, Referentiel } from '../ui/types.d';
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
  mesureAEditer?: MesureEditee;
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
  id: string;
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
  id: string;
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

type TypeActiviteMesure =
  | 'ajoutStatut'
  | 'miseAJourStatut'
  | 'ajoutPriorite'
  | 'miseAJourPriorite'
  | 'ajoutResponsable'
  | 'suppressionResponsable'
  | 'ajoutEcheance'
  | 'suppressionEcheance'
  | 'miseAJourEcheance'
  | 'ajoutCommentaire';

type DetailsActiviteMesure =
  | DetailsAjoutPropriete
  | DetailsSuppressionPropriete
  | DetailsMiseAJourPropriete
  | DetailsModificationResponsable
  | DetailsAjoutCommentaire;

export type ActiviteMesure = {
  idActeur: IdUtilisateur;
  date: Date;
  type: TypeActiviteMesure;
  details: DetailsActiviteMesure;
  identifiantNumeriqueMesure: string;
};

type ValeurPropriete = StatutMesure | Date | PrioriteMesure;

export type DetailsAjoutPropriete = {
  nouvelleValeur: ValeurPropriete;
};

export type DetailsSuppressionPropriete = {
  ancienneValeur: ValeurPropriete;
};

export type DetailsMiseAJourPropriete = {
  nouvelleValeur: ValeurPropriete;
  ancienneValeur: ValeurPropriete;
};

export type DetailsModificationResponsable = {
  valeur: string;
};

export type DetailsAjoutCommentaire = {
  contenu: string;
};
