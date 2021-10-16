const ListeItems = require('./listeItems');
const RisqueSpecifique = require('./risqueSpecifique');

class RisquesSpecifiques extends ListeItems {
  constructor(donnees) {
    const { risquesSpecifiques } = donnees;
    super(RisqueSpecifique, { items: risquesSpecifiques });
  }
}

module.exports = RisquesSpecifiques;
