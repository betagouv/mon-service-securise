const ElementsConstructibles = require('./elementsConstructibles');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');

class MesuresSpecifiques extends ElementsConstructibles {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { mesuresSpecifiques } = donnees;
    super(MesureSpecifique, { items: mesuresSpecifiques }, referentiel);
  }
}

module.exports = MesuresSpecifiques;
