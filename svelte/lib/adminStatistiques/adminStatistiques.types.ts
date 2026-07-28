import type { IdNiveauDeSecurite } from '../ui/types.d';

export type Statistiques = {
  servicesParNiveauSecurite: Partial<Record<IdNiveauDeSecurite, number>>;
};
