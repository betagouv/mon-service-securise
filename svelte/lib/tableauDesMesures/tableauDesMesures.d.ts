import {
  type EcheanceMesure,
  type PrioriteMesure,
  Referentiel,
} from '../ui/types.d';
import type { StatutMesure } from '../modeles/modeleMesure';
import type { VersionService } from '../../../src/modeles/versionService';

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
  versionService: VersionService;
  avecDecrireV2: boolean;
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
  id: string;
  idModele?: string;
  categorie: string;
  description: string;
  descriptionLongue?: string;
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
