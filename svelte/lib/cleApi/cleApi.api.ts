import type { AxiosResponse } from 'axios';
import type { CleApiCreee } from './cleApi.d';

export const api = {
  creeCle: async (
    dureeValiditeEnJours: number
  ): Promise<AxiosResponse<CleApiCreee>> =>
    axios.post('/api/cles-api', { dureeValiditeEnJours }),
  revoqueCle: async (id: string) => axios.delete(`/api/cles-api/${id}`),
};
