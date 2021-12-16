const { ErreurStatutDeploiementInvalide } = require('../erreurs');
const FonctionnalitesSpecifiques = require('./fonctionnalitesSpecifiques');
const InformationsHomologation = require('./informationsHomologation');
const PointsAcces = require('./pointsAcces');
const Referentiel = require('../referentiel');

class InformationsGenerales extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'delaiAvantImpactCritique',
        'nomService',
        'presenceResponsable',
        'statutDeploiement',
      ],
      proprietesListes: [
        'donneesCaracterePersonnel',
        'fonctionnalites',
        'typeService',
        'presentation',
        'provenanceService',
      ],
      listesAgregats: {
        pointsAcces: PointsAcces,
        fonctionnalitesSpecifiques: FonctionnalitesSpecifiques,
      },
    });
    InformationsGenerales.valide(donnees, referentiel);
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

  static valide(donnees, referentiel) {
    const { statutDeploiement } = donnees;

    if (statutDeploiement && !referentiel.statutDeploiementValide(statutDeploiement)) {
      throw new ErreurStatutDeploiementInvalide(
        `Le statut de déploiement "${statutDeploiement}" est invalide`
      );
    }
  }
}

module.exports = InformationsGenerales;
