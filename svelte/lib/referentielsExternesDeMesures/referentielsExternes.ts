export type ReferentielExterne = 'ReCyf' | 'ISO2700X' | 'AE2690';

export const LIBELLES_REFERENTIELS_EXTERNES: Record<
  ReferentielExterne,
  string
> = {
  ReCyf: 'NIS2-ReCyf',
  ISO2700X: 'ISO 2700X',
  AE2690: 'Annexe au Règlement d’exécution 2024/2690',
};
