import type { AxiosError } from 'axios';
import type { EntiteSupervisee } from './adminEntites.types';

export const api = {
  entitesDansMonPerimetre: async (): Promise<Array<EntiteSupervisee>> =>
    (await axios.get<Array<EntiteSupervisee>>('/api/admin/entites')).data,

  envoieInvitations: async (
    emails: Array<string>,
    siret: string
  ): Promise<void> => await axios.post('/api/admin/nomme', { emails, siret }),

  verifieEmail: async (email: string): Promise<{ existe: boolean }> => {
    try {
      const { data } = await axios.post('/api/admin/verifieEmail', { email });
      return data;
    } catch (e) {
      if ((e as AxiosError)?.response?.status === 400) return { existe: false };

      throw e;
    }
  },
};
