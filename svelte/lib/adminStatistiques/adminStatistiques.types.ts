import type { IdNiveauDeSecurite, IdTypeService } from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-admin-statistiques': CustomEvent;
  }
}

export type Statistiques = {
  servicesParNiveauSecurite: Partial<Record<IdNiveauDeSecurite, number>>;
  servicesParType: Partial<Record<IdTypeService, number>>;
};

export type ReferentielStatistiques = {
  typesService: Record<string, string>;
};

export type AdminStatistiquesProps = {
  referentiel: ReferentielStatistiques;
};
