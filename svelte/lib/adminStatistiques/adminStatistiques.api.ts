import type { IdNiveauDeSecurite } from '../ui/types';
import type { Statistiques } from './adminStatistiques.types';

export const api = {
  statistiques: async (filtres: {
    filtreNiveauxSecurite: IdNiveauDeSecurite[];
    filtreEntites: string[];
  }) =>
    (await axios.post<Statistiques>('/api/admin/statistiques', filtres)).data,
};
