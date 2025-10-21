export type ProfilUtilisateur = {
  utilisateur: { prenomNom: string };
  sourceAuthentification: 'MSS' | 'AGENT_CONNECT';
};

export const getUtilisateurCourant =
  async (): Promise<ProfilUtilisateur | null> => {
    try {
      const { data } = await axios.get('/api/utilisateurCourant');
      return data;
    } catch (e) {
      return null;
    }
  };
