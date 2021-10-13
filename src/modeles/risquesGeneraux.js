const ListeItems = require('./listeItems');
const RisqueGeneral = require('./risqueGeneral');

class RisquesGeneraux extends ListeItems {
  constructor(donnees, referentiel) {
    const { risquesGeneraux } = donnees;
    super(RisqueGeneral, { items: risquesGeneraux }, referentiel);
  }
}

module.exports = RisquesGeneraux;
