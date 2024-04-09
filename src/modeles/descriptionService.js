const {
  ErreurStatutDeploiementInvalide,
  ErreurLocalisationDonneesInvalide,
} = require('../erreurs');
const DonneesSensiblesSpecifiques = require('./donneesSensiblesSpecifiques');
const FonctionnalitesSpecifiques = require('./fonctionnalitesSpecifiques');
const InformationsHomologation = require('./informationsHomologation');
const PointsAcces = require('./pointsAcces');
const Referentiel = require('../referentiel');
const Entite = require('./entite');

class DescriptionService extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'delaiAvantImpactCritique',
        'localisationDonnees',
        'nomService',
        'provenanceService',
        'risqueJuridiqueFinancierReputationnel',
        'statutDeploiement',
        'nombreOrganisationsUtilisatrices',
      ],
      proprietesAtomiquesFacultatives: ['presentation'],
      proprietesListes: [
        'donneesCaracterePersonnel',
        'fonctionnalites',
        'typeService',
      ],
      listesAgregats: {
        donneesSensiblesSpecifiques: DonneesSensiblesSpecifiques,
        fonctionnalitesSpecifiques: FonctionnalitesSpecifiques,
        pointsAcces: PointsAcces,
      },
    });
    this.organisationResponsable = new Entite(donnees.organisationResponsable);
    DescriptionService.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionLocalisationDonnees() {
    return this.referentiel.localisationDonnees(this.localisationDonnees);
  }

  descriptionStatutDeploiement() {
    return this.referentiel.descriptionStatutDeploiement(
      this.statutDeploiement
    );
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

  donneesSerialisees() {
    return this.toJSON();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      organisationResponsable: this.organisationResponsable.toJSON(),
    };
  }

  static proprietesObligatoires() {
    return [
      'delaiAvantImpactCritique',
      'localisationDonnees',
      'nomService',
      'provenanceService',
      'risqueJuridiqueFinancierReputationnel',
      'statutDeploiement',
      'typeService',
      'nombreOrganisationsUtilisatrices',
    ];
  }

  static valide(donnees, referentiel) {
    const { statutDeploiement, localisationDonnees } = donnees;

    if (
      statutDeploiement &&
      !referentiel.statutDeploiementValide(statutDeploiement)
    ) {
      throw new ErreurStatutDeploiementInvalide(
        `Le statut de déploiement "${statutDeploiement}" est invalide`
      );
    }

    if (
      localisationDonnees &&
      !referentiel
        .identifiantsLocalisationsDonnees()
        .includes(localisationDonnees)
    ) {
      throw new ErreurLocalisationDonneesInvalide(
        `La localisation des données "${localisationDonnees}" est invalide`
      );
    }
  }
}

module.exports = DescriptionService;
