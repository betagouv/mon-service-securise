import type { IdNiveauDeSecurite, IdTypeService } from '../ui/types.d';

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
};

export type ReferentielStatistiques = {
  typesService: Record<string, string>;
};

export type AdminStatistiquesProps = {
  referentiel: ReferentielStatistiques;
};
