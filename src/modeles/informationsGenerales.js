const { ErreurStatutDeploiementInvalide, ErreurLocalisationDonneesInvalide } = require('../erreurs');
const FonctionnalitesSpecifiques = require('./fonctionnalitesSpecifiques');
const InformationsHomologation = require('./informationsHomologation');
const PointsAcces = require('./pointsAcces');
const Referentiel = require('../referentiel');

class InformationsGenerales extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'delaiAvantImpactCritique',
        'localisationDonnees',
        'nomService',
        'presenceResponsable',
        'presentation',
        'statutDeploiement',
      ],
      proprietesListes: [
        'donneesCaracterePersonnel',
        'fonctionnalites',
        'typeService',
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

  descriptionLocalisationDonnees() {
    return this.referentiel.localisationDonnees(this.localisationDonnees);
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
    const { statutDeploiement, localisationDonnees } = donnees;

    if (statutDeploiement && !referentiel.statutDeploiementValide(statutDeploiement)) {
      throw new ErreurStatutDeploiementInvalide(
        `Le statut de déploiement "${statutDeploiement}" est invalide`
      );
    }

    if (localisationDonnees
      && !referentiel.identifiantsLocalisationsDonnees().includes(localisationDonnees)) {
      throw new ErreurLocalisationDonneesInvalide(
        `La localisation des données "${localisationDonnees}" est invalide`
      );
    }
  }
}

module.exports = InformationsGenerales;
