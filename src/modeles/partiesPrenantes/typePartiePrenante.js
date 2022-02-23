const Hebergement = require('./hebergement');
const DeveloppementFourniture = require('./developpementFourniture');

const estType = (Type) => (objet) => (
  objet.constructor.name === Type.name
);

exports.estHebergement = estType(Hebergement);

exports.estDeveloppementFourniture = estType(DeveloppementFourniture);
