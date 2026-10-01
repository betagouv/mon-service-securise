import type { AxiosResponse } from 'axios';
import type { Groupe } from './groupes.d';

export const api = {
  ajouteGroupe: async (libelle: string): Promise<AxiosResponse<Groupe>> =>
    axios.post('/api/groupes-services', { libelle }),
};
