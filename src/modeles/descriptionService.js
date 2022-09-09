const { ErreurStatutDeploiementInvalide, ErreurLocalisationDonneesInvalide } = require('../erreurs');
const DonneesSensiblesSpecifiques = require('./donneesSensiblesSpecifiques');
const FonctionnalitesSpecifiques = require('./fonctionnalitesSpecifiques');
const InformationsHomologation = require('./informationsHomologation');
const PointsAcces = require('./pointsAcces');
const Referentiel = require('../referentiel');

class DescriptionService extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'delaiAvantImpactCritique',
        'localisationDonnees',
        'nomService',
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
        donneesSensiblesSpecifiques: DonneesSensiblesSpecifiques,
        fonctionnalitesSpecifiques: FonctionnalitesSpecifiques,
        pointsAcces: PointsAcces,
      },
    });
    DescriptionService.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionLocalisationDonnees() {
    return this.referentiel.localisationDonnees(this.localisationDonnees);
  }

  descriptionStatutDeploiement() {
    return this.referentiel.descriptionStatutDeploiement(this.statutDeploiement);
  }

  descriptionTypeService() {
    return this.referentiel.typeService(this.typeService);
  }

  nombreDonneesSensiblesSpecifiques() {
    return this.donneesSensiblesSpecifiques.nombre();
  }

  nombreFonctionnalitesSpecifiques() {
    return this.fonctionnalitesSpecifiques.nombre();
  }

  nombrePointsAcces() {
    return this.pointsAcces.nombre();
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

module.exports = DescriptionService;
