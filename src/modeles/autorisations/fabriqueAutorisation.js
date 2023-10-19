const AutorisationBase = require('./autorisationBase');

const CONSTRUCTEURS_AUTORISATIONS = {
  contributeur: AutorisationBase.NouvelleAutorisationContributeur,
  createur: AutorisationBase.NouvelleAutorisationProprietaire,
};

const fabrique = ({ type, ...autresDonnees }) =>
  CONSTRUCTEURS_AUTORISATIONS[type](autresDonnees);

module.exports = { fabrique };
