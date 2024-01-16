export enum Referentiel {
  ANSSI = 'ANSSI',
  SPECIFIQUE = 'Mesures ajoutées',
  CNIL = 'CNIL',
}

export type IdStatut = string;

export type ReferentielStatut = Record<IdStatut, string>;
