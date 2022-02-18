const Hebergement = require('./hebergement');
const DeveloppementFourniture = require('./developpementFourniture');
const PartiePrenanteSpecifique = require('./partiePrenanteSpecifique');

const estType = (Type) => (objet) => (
  objet.constructor.name === Type.name
);

exports.estDeveloppementFourniture = estType(DeveloppementFourniture);

exports.estHebergement = estType(Hebergement);

exports.estSpecifique = estType(PartiePrenanteSpecifique);
