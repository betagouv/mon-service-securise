const InformationsHomologation = require('./informationsHomologation');
const PointsAcces = require('./pointsAcces');
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
    ], {
      pointsAcces: PointsAcces,
    });
    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionNatureService() {
    return this.referentiel.natureService(this.natureService);
  }

  nombrePointsAcces() {
    return this.pointsAcces.nombre();
  }

  seuilCriticite() {
    return this.referentiel.criticite(
      this.fonctionnalites, this.donneesCaracterePersonnel, this.delaiAvantImpactCritique
    );
  }
}

module.exports = InformationsGenerales;
