const {
  ErreurStatutDeploiementInvalide,
  ErreurLocalisationDonneesInvalide,
} = require('../erreurs');
const DonneesSensiblesSpecifiques = require('./donneesSensiblesSpecifiques');
const FonctionnalitesSpecifiques = require('./fonctionnalitesSpecifiques');
const InformationsService = require('./informationsService');
const PointsAcces = require('./pointsAcces');
const Referentiel = require('../referentiel');
const Entite = require('./entite');

const tousNiveauxSecurite = ['niveau1', 'niveau2', 'niveau3'];

class DescriptionService extends InformationsService {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'delaiAvantImpactCritique',
        'localisationDonnees',
        'nomService',
        'provenanceService',
        'statutDeploiement',
        'nombreOrganisationsUtilisatrices',
        'niveauSecurite',
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

  statutSaisie() {
    const statutSaisieDeBase = super.statutSaisie();
    if (statutSaisieDeBase !== DescriptionService.COMPLETES) {
      return statutSaisieDeBase;
    }
    return this.organisationResponsable?.statutSaisie() === Entite.COMPLETES
      ? DescriptionService.COMPLETES
      : DescriptionService.A_COMPLETER;
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
      'statutDeploiement',
      'typeService',
      'nombreOrganisationsUtilisatrices',
      'niveauSecurite',
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

  static estimeNiveauDeSecurite(donnees) {
    const estDeNiveau3 =
      donnees.fonctionnalites?.includes('signatureElectronique') ||
      donnees.donneesCaracterePersonnel?.includes('sensibiliteParticuliere') ||
      donnees.delaiAvantImpactCritique === 'moinsUneHeure';
    if (estDeNiveau3) return 'niveau3';

    const fonctionnalitesNiveau2 = [
      'reseauSocial',
      'visionconference',
      'messagerie',
      'edition',
      'paiement',
    ];
    const donneesPersonnelNiveau2 = ['identite', 'situation', 'mineurs'];
    const estDeNiveau2 =
      donnees.fonctionnalites?.some((f) =>
        fonctionnalitesNiveau2.includes(f)
      ) ||
      donnees.donneesCaracterePersonnel?.some((f) =>
        donneesPersonnelNiveau2.includes(f)
      );
    if (estDeNiveau2) return 'niveau2';

    return 'niveau1';
  }

  static estNiveauDeSecuriteValide(niveauSecurite) {
    return tousNiveauxSecurite.indexOf(niveauSecurite) >= 0;
  }

  static niveauSecuriteChoisiSuffisant(donnees) {
    const niveauMinimal = DescriptionService.estimeNiveauDeSecurite(donnees);
    return (
      tousNiveauxSecurite.indexOf(donnees.niveauSecurite) >=
      tousNiveauxSecurite.indexOf(niveauMinimal)
    );
  }

  static niveauSecuriteSuperieurRecommandation(donnees) {
    const niveauRecommande = DescriptionService.estimeNiveauDeSecurite(donnees);
    return (
      tousNiveauxSecurite.indexOf(donnees.niveauSecurite) >
      tousNiveauxSecurite.indexOf(niveauRecommande)
    );
  }
}

module.exports = DescriptionService;
