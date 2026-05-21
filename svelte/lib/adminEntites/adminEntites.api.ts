import type { EntiteSupervisee } from './adminEntites.types';

export const api = {
  entitesDansMonPerimetre: async (): Promise<Array<EntiteSupervisee>> =>
    (await axios.get<Array<EntiteSupervisee>>('/api/admin/entites')).data,
};
