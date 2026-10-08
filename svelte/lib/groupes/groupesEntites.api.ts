import type { ApiGroupes, GroupeEntites } from './groupes.d';

export const apiGroupesEntites: ApiGroupes<GroupeEntites> = {
  lisGroupes: async () =>
    (await axios.get<GroupeEntites[]>('/api/admin/groupes-entites')).data,
  ajouteGroupe: async (libelle: string) =>
    axios.post('/api/admin/groupes-entites', { libelle }),
  renommeGroupe: async (id: string, libelle: string) =>
    axios.put(`/api/admin/groupes-entites/${id}`, { libelle }),
  supprimeGroupe: async (id: string) =>
    axios.delete(`/api/admin/groupes-entites/${id}`),
};
