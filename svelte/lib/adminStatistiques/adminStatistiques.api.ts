import type { IdNiveauDeSecurite } from '../ui/types';
import type { Statistiques } from './adminStatistiques.types';

export const api = {
  statistiques: async (filtres: {
    filtreNiveauxSecurite: IdNiveauDeSecurite[];
    filtreEntites: string[];
  }) => {
    const params = new URLSearchParams();
    filtres.filtreNiveauxSecurite.forEach((niveau) =>
      params.append('filtreNiveauxSecurite', niveau)
    );
    filtres.filtreEntites.forEach((entite) =>
      params.append('filtreEntites', entite)
    );

    return (
      await axios.get<Statistiques>('/api/admin/statistiques', { params })
    ).data;
  },
};
