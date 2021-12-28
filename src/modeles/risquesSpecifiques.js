const ListeRisques = require('./listeRisques');
const RisqueSpecifique = require('./risqueSpecifique');

class RisquesSpecifiques extends ListeRisques {
  constructor(donnees, referentiel) {
    const { risquesSpecifiques } = donnees;
    super(RisqueSpecifique, { items: risquesSpecifiques }, referentiel);
  }
}

module.exports = RisquesSpecifiques;
