import type { IdMesureV2 } from '../../../../donneesReferentielMesuresV2.js';
import type { StatutMesure } from '../../../modeles/mesure.js';

export type Vraisemblance = 1 | 2 | 3 | 4;

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

export type MesureAvecStatut = {
  statut: StatutMesure | '';
};

export type ConfigurationPredicatVraisemblance = {
  [K in IdentifiantGroupeMesureVraisemblance]: MesureAvecStatut[];
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
