const Base = require('./base');
const Referentiel = require('../referentiel');

class InformationsGenerales extends Base {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super([
      'delaiAvantImpactCritique',
      'dejaMisEnLigne',
      'donneesCaracterePersonnel',
      'fonctionnalites',
      'natureService',
      'nomService',
      'presenceResponsable',
      'provenanceService',
    ]);
    this.renseigneProprietes(donnees);

    this.natureService ||= [];
    this.referentiel = referentiel;
  }

  descriptionNatureService() {
    return this.referentiel.natureService(this.natureService);
  }
}

module.exports = InformationsGenerales;
