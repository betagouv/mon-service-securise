const ListeItems = require('../listeItems');
const PartiePrenante = require('./partiePrenante');

class PartiesPrenantes extends ListeItems {
  constructor(donnees = {}) {
    const { partiesPrenantes = [] } = donnees;
    super(PartiePrenante, { items: partiesPrenantes });
  }
}

module.exports = PartiesPrenantes;
