const Hebergement = require('./hebergement');

exports.estHebergement = (partiePrenante) => (
  partiePrenante.constructor.name === Hebergement.name
);
