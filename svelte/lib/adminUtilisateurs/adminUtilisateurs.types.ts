export type Role =
  | 'LECTURE'
  | 'ECRITURE'
  | 'PERSONNALISE'
  | 'ADMIN'
  | 'PROPRIETAIRE';

export type UtilisateurAdministre = {
  id: string;
  prenomNom: string;
  email: string;
  postes: string;
  estAdmin: boolean;
  nombreEntites: number;
  autorisations: Array<{ idService: string; role: Role }>;
};

export const labelsRole: Record<Role, string> = {
  ADMIN: 'Admin',
  ECRITURE: 'Éditeur',
  LECTURE: 'Lecteur',
  PERSONNALISE: 'Personnalisé',
  PROPRIETAIRE: 'Propriétaire',
};

export const rolesAssignables: Partial<Record<Role, string>> =
  Object.fromEntries(
    Object.entries(labelsRole).filter(([role]) =>
      ['ECRITURE', 'LECTURE', 'PROPRIETAIRE'].includes(role)
    )
  );

export type ServiceAdministre = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  siretOrganisationResponsable: string;
  role?: Role;
};
