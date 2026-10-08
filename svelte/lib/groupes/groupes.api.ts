import type { AxiosError, AxiosResponse } from 'axios';
import type { Groupe } from './groupes.d';

export const api = {
  lisGroupes: async (): Promise<Groupe[]> =>
    (await axios.get<Groupe[]>('/api/groupes-services')).data,
  ajouteGroupe: async (libelle: string): Promise<AxiosResponse<Groupe>> =>
    axios.post('/api/groupes-services', { libelle }),
  renommeGroupe: async (id: string, libelle: string) =>
    axios.put(`/api/groupes-services/${id}`, { libelle }),
  supprimeGroupe: async (id: string) =>
    axios.delete(`/api/groupes-services/${id}`),
};

export const estUnLibelleDejaUtilise = (e: unknown) => {
  const { response } = e as AxiosError<{ erreur: { code: string } }>;
  return (
    response?.status === 422 &&
    response.data?.erreur?.code === 'LIBELLE_GROUPE_DEJA_EXISTANT'
  );
};
