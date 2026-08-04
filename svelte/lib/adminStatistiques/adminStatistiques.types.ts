import {
  CategorieMesure,
  type IdNiveauDeSecurite,
  type IdTypeService,
} from '../ui/types.d';
import type { StatutMesure } from '../modeles/modeleMesure';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-admin-statistiques': CustomEvent;
  }
}

type EvolutionMensuelle = Array<{ mois: string; total: number }>;

export type TrancheExpirationHomologation =
  | 'expire'
  | '< 6'
  | '< 12'
  | '< 24'
  | '< 36';

export type Statistiques = {
  nombreServicesCompletudeSuperieur80: number;
  nombreServicesHomologues: number;
  servicesParNiveauSecurite: Partial<Record<IdNiveauDeSecurite, number>>;
  servicesParType: Partial<Record<IdTypeService, number>>;
  evolutionNombreServices: EvolutionMensuelle;
  evolutionNombreOrganisations: EvolutionMensuelle;
  evolutionNombreHomologations: EvolutionMensuelle;
  indiceCyberMoyen: number;
  servicesParTrancheExpirationHomologation: Record<
    TrancheExpirationHomologation,
    number
  >;
  servicesParTrancheIndiceCyber: Record<
    '< 1' | '< 2' | '< 3' | '< 4' | '≥ 4',
    number
  >;
  servicesParTrancheCompletudeMesures: Record<
    '< 25%' | '< 50%' | '< 75%' | '≤ 100%',
    number
  >;
  nombreMesuresParStatutEtCategorie: Record<
    CategorieMesure,
    Record<StatutMesure, number>
  >;
};

export type ReferentielStatistiques = {
  typesService: Record<string, string>;
  statutsMesures: Record<StatutMesure, string>;
  categoriesMesures: Record<CategorieMesure, string>;
};

export type AdminStatistiquesProps = {
  referentiel: ReferentielStatistiques;
};
