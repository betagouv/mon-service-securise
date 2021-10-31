const ListeItems = require('./listeItems');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');

class MesuresSpecifiques extends ListeItems {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { mesuresSpecifiques } = donnees;
    super(MesureSpecifique, { items: mesuresSpecifiques }, referentiel);
  }

  statutSaisie() {
    return super.statutSaisie() === MesuresSpecifiques.A_COMPLETER
      ? MesuresSpecifiques.A_COMPLETER
      : MesuresSpecifiques.COMPLETES;
  }
}

module.exports = MesuresSpecifiques;
