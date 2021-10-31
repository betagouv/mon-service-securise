const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class MesureSpecifique extends InformationsHomologation {
  constructor(donneesMesure = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['description', 'categorie', 'statut', 'modalites']);
    this.renseigneProprietes(donneesMesure);
    this.referentiel = referentiel;
  }

  proprieteSaisie(nomPropriete) {
    return nomPropriete === 'modalites' ? true : super.proprieteSaisie(nomPropriete);
  }
}

module.exports = MesureSpecifique;
