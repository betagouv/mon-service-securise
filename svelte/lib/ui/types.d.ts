export enum Referentiel {
  ANSSI = 'ANSSI',
  SPECIFIQUE = 'Mesures ajoutées',
}

export type IdStatut = string;

export type ReferentielStatut = Record<IdStatut, string>;
