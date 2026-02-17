import type { IdMesureV2 } from '../../../../donneesReferentielMesuresV2.js';
import type MesureGenerale from '../../../modeles/mesureGenerale.js';

export type IdentifiantGroupeMesureVraisemblance =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g';

export type PoidsGroupeMesure = {
  [K in Capitalize<IdentifiantGroupeMesureVraisemblance> as `poids${K}`]: number;
};

export type ConfigurationPredicatVraisemblance = {
  [K in IdentifiantGroupeMesureVraisemblance]: MesureGenerale[];
} & PoidsGroupeMesure;
export type ConfigurationPourNiveau = {
  formules: Array<
    (configuration: ConfigurationPredicatVraisemblance) => number
  >;
  groupes: Partial<
    Record<
      IdentifiantGroupeMesureVraisemblance,
      {
        poids: number;
        idsMesures: IdMesureV2[];
      }
    >
  >;
};

export type ConfigurationVraisemblancePourUnVecteur = {
  niveau1?: ConfigurationPourNiveau;
  niveau2?: ConfigurationPourNiveau;
  niveau3?: ConfigurationPourNiveau;
};
