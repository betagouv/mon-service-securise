import type { Statistiques } from './adminStatistiques.types';

export const api = {
  statistiques: async () =>
    (await axios.get<Statistiques>('/api/admin/statistiques')).data,
};
