import type { Utilisateur } from '../ui/types';

export const api = {
  utilisateursDansMonPerimetre: async (): Promise<Utilisateur[]> =>
    (await axios.get<Utilisateur[]>('/api/admin/utilisateurs')).data,
};
