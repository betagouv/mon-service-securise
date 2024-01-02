export enum Referentiel {
  ANSSI,
  SPECIFIQUE,
}

export type IdStatut = string;

export type ReferentielStatut = Record<IdStatut, string>;
