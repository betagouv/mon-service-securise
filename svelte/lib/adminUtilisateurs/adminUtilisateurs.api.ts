import type {
  Role,
  ServiceAdministre,
  UtilisateurAdministre,
} from './adminUtilisateurs.types';

export const api = {
  tousServices: async (): Promise<ServiceAdministre[]> =>
    (await axios.get<{ services: ServiceAdministre[] }>('/api/services')).data
      .services,
  utilisateursDansMonPerimetre: async (): Promise<UtilisateurAdministre[]> =>
    (await axios.get<UtilisateurAdministre[]>('/api/admin/utilisateurs')).data,
  appliqueNouveauxRoles: async (
    idUtilisateur: string,
    idsServices: string[],
    role: Role
  ) =>
    await axios.post(`/api/admin/utilisateurs/${idUtilisateur}/roles`, {
      role,
      idsServices,
    }),
};
