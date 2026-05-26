export type UtilisateurAdministre = {
  id: string;
  prenomNom: string;
  email: string;
  postes: string;
  estAdmin: boolean;
  nombreEntites: number;
};

export const api = {
  utilisateursDansMonPerimetre: async (): Promise<UtilisateurAdministre[]> =>
    (await axios.get<UtilisateurAdministre[]>('/api/admin/utilisateurs')).data,
};
