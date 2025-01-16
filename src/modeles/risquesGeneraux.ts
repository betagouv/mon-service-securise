const ListeRisques = require('./listeRisques');
const RisqueGeneral = require('./risqueGeneral');

class RisquesGeneraux extends ListeRisques {
  constructor(donnees, referentiel) {
    const { risquesGeneraux } = donnees;
    super(RisqueGeneral, { items: risquesGeneraux }, referentiel);
  }
}

module.exports = RisquesGeneraux;
