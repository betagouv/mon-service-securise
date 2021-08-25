const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class InformationsGenerales extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super([
      'delaiAvantImpactCritique',
      'dejaMisEnLigne',
      'nomService',
      'presenceResponsable',
    ], [
      'donneesCaracterePersonnel',
      'fonctionnalites',
      'natureService',
      'provenanceService',
    ]);
    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  criticite() {
    return this.referentiel.criticite(
      this.fonctionnalites, this.donneesCaracterePersonnel, this.delaiAvantImpactCritique
    );
  }

  descriptionNatureService() {
    return this.referentiel.natureService(this.natureService);
  }
}

module.exports = InformationsGenerales;
