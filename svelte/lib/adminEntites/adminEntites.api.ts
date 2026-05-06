import type { Entite } from '../ui/types';

export const api = {
  entitesDansMonPerimetre: async (): Promise<Entite[]> =>
    (await axios.get<Entite[]>('/api/admin/entites')).data,
};
