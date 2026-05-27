export type UtilisateurAdministre = {
  id: string;
  prenomNom: string;
  email: string;
  postes: string;
  estAdmin: boolean;
  nombreEntites: number;
  nombreServices: number;
};

export type ServiceAdministre = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  siretOrganisationResponsable: string;
};

export const api = {
  servicesDeUtilisateur: async (
    _idUtilisateur: string
  ): Promise<ServiceAdministre[]> => [
    {
      id: '4fc3a60d-7c32-414e-8c49-063b588b1728',
      nomService: 'Mon service',
      organisationResponsable: 'SIRET',
      siretOrganisationResponsable: '1234',
    },
  ],
  tousServices: async (): Promise<ServiceAdministre[]> =>
    (await axios.get<{ services: ServiceAdministre[] }>('/api/services')).data
      .services,
  utilisateursDansMonPerimetre: async (): Promise<UtilisateurAdministre[]> =>
    (await axios.get<UtilisateurAdministre[]>('/api/admin/utilisateurs')).data,
};
