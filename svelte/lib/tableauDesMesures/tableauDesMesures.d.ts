import {
  type EcheanceMesure,
  type PrioriteMesure,
  Referentiel,
} from '../ui/types.d';
import type { StatutMesure } from '../modeles/mesure';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-mesures': CustomEvent;
  }
}

export type IdService = string;
export type IdCategorie = string;

export type TableauDesMesuresProps = {
  idService: IdService;
  categories: Record<IdCategorie, string>;
  statuts: Record<StatutMesure, string>;
  estLectureSeule: boolean;
  modeVisiteGuidee: boolean;
};

export type MesureGenerale = {
  description: string;
  categorie: string;
  indispensable: boolean;
  descriptionLongue: string;
  statut?: StatutMesure;
  modalites?: string;
  referentiel: Referentiel;
  identifiantNumerique: string;
  priorite?: PrioriteMesure;
  echeance?: EcheanceMesure;
  responsables?: IdUtilisateur[];
};

export type MesureSpecifique = {
  categorie: string;
  description: string;
  statut: StatutMesure;
  modalites: string;
  identifiantNumerique: string;
  priorite?: PrioriteMesure;
  echeance?: EcheanceMesure;
  responsables?: IdUtilisateur[];
};

export type IdUtilisateur = string;

export type IdMesureGenerale = string;
export type Mesures = {
  mesuresGenerales: Record<IdMesureGenerale, MesureGenerale>;
  mesuresSpecifiques: MesureSpecifique[];
};

export enum EtatEnregistrement {
  Jamais,
  EnCours,
  Fait,
}

export type Contributeur = {
  estUtilisateurCourant: boolean;
  id: string;
  initiales: string;
  poste: string;
  prenomNom: string;
};
