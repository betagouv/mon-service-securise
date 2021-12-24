const FonctionnalitesSpecifiques = require('./fonctionnalitesSpecifiques');
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
      fonctionnalitesSpecifiques: FonctionnalitesSpecifiques,
    });

    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionTypeService() {
    return this.referentiel.typeService(this.typeService);
  }

  nombreFonctionnalitesSpecifiques() {
    return this.fonctionnalitesSpecifiques.nombre();
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
