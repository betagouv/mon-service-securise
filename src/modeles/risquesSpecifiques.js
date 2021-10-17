const ListeItems = require('./listeItems');
const RisqueSpecifique = require('./risqueSpecifique');

class RisquesSpecifiques extends ListeItems {
  constructor(donnees) {
    const { risquesSpecifiques } = donnees;
    super(RisqueSpecifique, { items: risquesSpecifiques });
  }

  statutSaisie() {
    return this.items.every((i) => !!i.description)
      ? RisquesSpecifiques.COMPLETES
      : RisquesSpecifiques.A_COMPLETER;
  }
}

module.exports = RisquesSpecifiques;
