const AutorisationCreateur = require('./autorisationCreateur');

const fabrique = ({ type, ...autresDonnees }) => new AutorisationCreateur(autresDonnees);

module.exports = { fabrique };
