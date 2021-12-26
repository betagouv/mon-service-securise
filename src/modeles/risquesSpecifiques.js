const ListeItems = require('./listeItems');
const RisqueSpecifique = require('./risqueSpecifique');

class RisquesSpecifiques extends ListeItems {
  constructor(donnees, referentiel) {
    const { risquesSpecifiques } = donnees;
    super(RisqueSpecifique, { items: risquesSpecifiques }, referentiel);
  }
}

module.exports = RisquesSpecifiques;
