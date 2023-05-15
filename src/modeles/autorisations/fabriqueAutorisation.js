const AutorisationContributeur = require('./autorisationContributeur');
const AutorisationCreateur = require('./autorisationCreateur');

const CLASSES_AUTORISATIONS = {
  contributeur: AutorisationContributeur,
  createur: AutorisationCreateur,
};

const fabrique = ({ type, ...autresDonnees }) =>
  new CLASSES_AUTORISATIONS[type](autresDonnees);

module.exports = { fabrique };
