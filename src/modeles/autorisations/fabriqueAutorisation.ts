import { Autorisation, type DonneesAutorisation } from './autorisation.js';

export const fabrique = (donnees: DonneesAutorisation) =>
  donnees.estProprietaire
    ? Autorisation.NouvelleAutorisationProprietaire(donnees)
    : Autorisation.NouvelleAutorisationContributeur(donnees);
