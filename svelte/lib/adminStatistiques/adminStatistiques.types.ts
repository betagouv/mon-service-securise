import type { IdNiveauDeSecurite, IdTypeService } from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-admin-statistiques': CustomEvent;
  }
}

type EvolutionMensuelle = Array<{ mois: string; total: number }>;

export type Statistiques = {
  nombreServicesHomologues: number;
  servicesParNiveauSecurite: Partial<Record<IdNiveauDeSecurite, number>>;
  servicesParType: Partial<Record<IdTypeService, number>>;
  evolutionNombreServices: EvolutionMensuelle;
  evolutionNombreOrganisations: EvolutionMensuelle;
  indiceCyberMoyen: number;
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
