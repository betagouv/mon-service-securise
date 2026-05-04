import { Autorisation, type DonneesAutorisation } from './autorisation.js';

export const fabrique = (donnees: DonneesAutorisation) => {
  if (donnees.estAdmin) {
    return Autorisation.NouvelleAutorisationAdmin(donnees);
  }
  return donnees.estProprietaire
    ? Autorisation.NouvelleAutorisationProprietaire(donnees)
    : Autorisation.NouvelleAutorisationContributeur(donnees);
};
