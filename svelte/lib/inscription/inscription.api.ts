import type { FormulaireInscription } from './inscription.d';

export const finaliseInscriptionSuiteInvitation = (
  formulaireInscription: FormulaireInscription
) => {
  const { prenom: _, nom: __, ...donneesProfilInvite } = formulaireInscription;
  return axios.put('/api/utilisateur', donneesProfilInvite);
};

export const inscrisNouvelUtilisateur = async (
  formulaireInscription: FormulaireInscription
) => {
  const {
    prenom: _,
    nom: __,
    ...donneesNouvelleInscription
  } = formulaireInscription;
  await axios.post('/api/utilisateur', donneesNouvelleInscription);
};
