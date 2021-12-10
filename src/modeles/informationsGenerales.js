const FonctionnalitesSupplementaires = require('./fonctionnalitesSupplementaires');
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
      'typeService',
      'provenanceService',
    ], {
      pointsAcces: PointsAcces,
      fonctionnalitesSupplementaires: FonctionnalitesSupplementaires,
    });

    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionTypeService() {
    return this.referentiel.typeService(this.typeService);
  }

  nombreFonctionnalitesSupplementaires() {
    return this.fonctionnalitesSupplementaires.nombre();
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
