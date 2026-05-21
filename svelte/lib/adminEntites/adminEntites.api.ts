import type { EntiteSupervisee } from './adminEntites.types';

export const api = {
  entitesDansMonPerimetre: async (): Promise<Array<EntiteSupervisee>> =>
    (await axios.get<Array<EntiteSupervisee>>('/api/admin/entites')).data,
  envoieInvitations: async (
    emails: Array<string>,
    siret: string
  ): Promise<void> => await axios.post('/api/admin/nomme', { emails, siret }),
};
