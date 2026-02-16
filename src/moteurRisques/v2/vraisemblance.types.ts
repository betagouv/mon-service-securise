import type { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import type MesureGenerale from '../../modeles/mesureGenerale.js';

type IdentifiantGroupe = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

export type ConfigurationPredicatVraisemblance = {
  [K in IdentifiantGroupe]: MesureGenerale[];
} & {
  [K in Capitalize<IdentifiantGroupe> as `poids${K}`]: number;
};

type ConfigurationPourNiveau = {
  formules: Array<
    (configuration: ConfigurationPredicatVraisemblance) => number
  >;
  groupes: Partial<
    Record<
      IdentifiantGroupe,
      {
        poids: number;
        idsMesures: IdMesureV2[];
      }
    >
  >;
};

export type ConfigurationVraisemblancePourUnVecteur = {
  niveau1: ConfigurationPourNiveau;
  niveau2: ConfigurationPourNiveau;
  niveau3: ConfigurationPourNiveau;
};
