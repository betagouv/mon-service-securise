const Dossier = require('./dossier');
const ElementsConstructibles = require('./elementsConstructibles');
const Referentiel = require('../referentiel');

class Dossiers extends ElementsConstructibles {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { dossiers } = donnees;
    super(Dossier, { items: dossiers }, referentiel);
  }
}

module.exports = Dossiers;
