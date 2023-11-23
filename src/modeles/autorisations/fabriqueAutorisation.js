const AutorisationBase = require('./autorisationBase');

const fabrique = (donnees) =>
  donnees.estProprietaire
    ? AutorisationBase.NouvelleAutorisationProprietaire(donnees)
    : AutorisationBase.NouvelleAutorisationContributeur(donnees);

module.exports = { fabrique };
