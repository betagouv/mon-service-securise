import type { IdNiveauDeSecurite, IdTypeService } from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-admin-statistiques': CustomEvent;
  }
}

type EvolutionMensurelle = Array<{ mois: string; total: number }>;

export type Statistiques = {
  servicesParNiveauSecurite: Partial<Record<IdNiveauDeSecurite, number>>;
  servicesParType: Partial<Record<IdTypeService, number>>;
  evolutionNombreServices: EvolutionMensurelle;
  evolutionNombreOrganisations: EvolutionMensurelle;
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
