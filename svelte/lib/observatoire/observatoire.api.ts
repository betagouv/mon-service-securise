import type {
  DonneesObservatoire,
  FiltresObservatoire,
} from './observatoire.d';

export const api = {
  donnees: async (filtres: FiltresObservatoire) =>
    (
      await axios.get<DonneesObservatoire>('/api/observatoire', {
        params: filtres,
      })
    ).data,
};
