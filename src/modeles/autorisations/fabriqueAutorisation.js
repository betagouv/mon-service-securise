const Autorisation = require('./autorisation');

const fabrique = (donnees) =>
  donnees.estProprietaire
    ? Autorisation.NouvelleAutorisationProprietaire(donnees)
    : Autorisation.NouvelleAutorisationContributeur(donnees);

module.exports = { fabrique };
