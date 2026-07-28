import type { IdNiveauDeSecurite, IdTypeService } from '../ui/types.d';

export type Statistiques = {
  servicesParNiveauSecurite: Partial<Record<IdNiveauDeSecurite, number>>;
  servicesParType: Partial<Record<IdTypeService, number>>;
};
