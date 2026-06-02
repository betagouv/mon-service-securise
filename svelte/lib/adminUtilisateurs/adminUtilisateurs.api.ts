export type UtilisateurAdministre = {
  id: string;
  prenomNom: string;
  email: string;
  postes: string;
  estAdmin: boolean;
  nombreEntites: number;
  autorisations: Array<{ idService: string; role: Role }>;
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
  tousServices: async (): Promise<ServiceAdministre[]> =>
    (await axios.get<{ services: ServiceAdministre[] }>('/api/services')).data
      .services,
  utilisateursDansMonPerimetre: async (): Promise<UtilisateurAdministre[]> =>
    (await axios.get<UtilisateurAdministre[]>('/api/admin/utilisateurs')).data,
};
