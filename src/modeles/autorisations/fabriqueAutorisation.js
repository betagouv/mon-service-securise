import { Autorisation } from './autorisation.js';

const fabrique = (donnees) =>
  donnees.estProprietaire
    ? Autorisation.NouvelleAutorisationProprietaire(donnees)
    : Autorisation.NouvelleAutorisationContributeur(donnees);

export { fabrique };
