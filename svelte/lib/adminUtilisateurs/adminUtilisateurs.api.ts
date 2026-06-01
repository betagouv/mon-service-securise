export type UtilisateurAdministre = {
  id: string;
  prenomNom: string;
  email: string;
  postes: string;
  estAdmin: boolean;
  nombreEntites: number;
  nombreServices: number;
};

type Role = 'LECTURE' | 'ECRITURE' | 'PERSONNALISE' | 'ADMIN' | 'PROPRIETAIRE';

export const labelsRole: Record<Role, string> = {
  ADMIN: 'Admin',
  ECRITURE: 'Éditeur',
  LECTURE: 'Lecteur',
  PERSONNALISE: 'Personnalisé',
  PROPRIETAIRE: 'Propriétaire',
};

export type ServiceAdministre = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  siretOrganisationResponsable: string;
  role?: Role;
};

export const api = {
  servicesDeUtilisateur: async (
    _idUtilisateur: string
  ): Promise<ServiceAdministre[]> => [
    {
      id: '4fc3a60d-7c32-414e-8c49-063b588b1728',
      nomService: 'Mon service',
      organisationResponsable: 'TMZN',
      siretOrganisationResponsable: '93939105800012',
      role: 'ADMIN',
    },
    {
      id: '4fc3a60d-7c32-414e-8c49-063b588b172f',
      nomService: 'Mon service pas administré',
      organisationResponsable:
        'DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)',
      siretOrganisationResponsable: '13002526500013',
      role: 'LECTURE',
    },
  ],
  tousServices: async (): Promise<ServiceAdministre[]> =>
    (await axios.get<{ services: ServiceAdministre[] }>('/api/services')).data
      .services,
  utilisateursDansMonPerimetre: async (): Promise<UtilisateurAdministre[]> =>
    (await axios.get<UtilisateurAdministre[]>('/api/admin/utilisateurs')).data,
};
