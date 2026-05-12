export type UtilisateurAdministre = {
  id: string;
  prenomNom: string;
  email: string;
  entite: {
    nom: string;
    siret: string;
    departement: string;
  };
  postes: Array<string>;
};

export const api = {
  utilisateursDansMonPerimetre: async (): Promise<UtilisateurAdministre[]> =>
    (await axios.get<UtilisateurAdministre[]>('/api/admin/utilisateurs')).data,
};
