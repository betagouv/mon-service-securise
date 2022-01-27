const PartiePrenante = require('./partiePrenante');

class Hebergement extends PartiePrenante {
  constructor(donnees) {
    super(donnees, 'hebergement');
  }
}

module.exports = Hebergement;
