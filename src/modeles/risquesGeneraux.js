const ListeItems = require('./listeItems');
const RisqueGeneral = require('./risqueGeneral');

class RisquesGeneraux extends ListeItems {
  constructor(donnees, referentiel) {
    const { risques } = donnees;
    super(RisqueGeneral, { items: risques }, referentiel);
  }
}

module.exports = RisquesGeneraux;
