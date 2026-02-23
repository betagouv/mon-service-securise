import {
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurDonneesObligatoiresManquantes,
  ErreurLocalisationDonneesInvalide,
  ErreurStatutDeploiementInvalide,
} from '../erreurs.js';
import DonneesSensiblesSpecifiques from './donneesSensiblesSpecifiques.js';
import FonctionnalitesSpecifiques from './fonctionnalitesSpecifiques.js';
import InformationsService from './informationsService.js';
import PointsAcces from './pointsAcces.js';
import Entite from './entite.js';
import { Referentiel } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';
import { NiveauSecurite } from '../../donneesReferentielMesuresV2.js';
import {
  DonneesDescriptionService,
  DonneesPourEstimationNiveauSecurite,
  NombreOrganisationsUtilisatrices,
} from './descriptionService.types.js';

const tousNiveauxSecurite = ['niveau1', 'niveau2', 'niveau3'];

class DescriptionService extends InformationsService {
  readonly delaiAvantImpactCritique!: string;
  readonly localisationDonnees!: string;
  readonly nomService!: string;
  readonly provenanceService!: string;
  readonly statutDeploiement!: string;
  readonly nombreOrganisationsUtilisatrices!: NombreOrganisationsUtilisatrices;
  readonly niveauSecurite!: NiveauSecurite;
  readonly presentation?: string;
  readonly donneesCaracterePersonnel!: string[];
  readonly fonctionnalites!: string[];
  readonly typeService!: string[];
  readonly donneesSensiblesSpecifiques!: DonneesSensiblesSpecifiques;
  readonly fonctionnalitesSpecifiques!: FonctionnalitesSpecifiques;
  readonly pointsAcces!: PointsAcces;
  readonly organisationResponsable: Entite;
  private readonly referentiel: Referentiel;

  constructor(
    donnees: Partial<DonneesDescriptionService> = {},
    referentiel: Referentiel = creeReferentielVide()
  ) {
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

  identifiantLocalisationDonnees() {
    return this.localisationDonnees;
  }

  descriptionStatutDeploiement() {
    return this.referentiel.descriptionStatutDeploiement(
      this.statutDeploiement
    );
  }

  descriptionTypeService() {
    return this.referentiel.typeService(this.typeService);
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

  static valide(
    donnees: Partial<DonneesDescriptionService>,
    referentiel: Referentiel
  ) {
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

  estimeNiveauDeSecurite() {
    return DescriptionService.estimeNiveauDeSecurite({
      fonctionnalites: this.fonctionnalites,
      donneesCaracterePersonnel: this.donneesCaracterePersonnel,
      delaiAvantImpactCritique: this.delaiAvantImpactCritique,
    });
  }

  niveauSecuriteDepasseRecommandation() {
    const niveauRecommande = this.estimeNiveauDeSecurite();
    return this.referentiel.niveauDeSecuriteDepasseRecommandation(
      this.niveauSecurite,
      niveauRecommande
    );
  }

  static estimeNiveauDeSecurite(donnees: DonneesPourEstimationNiveauSecurite) {
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

  static niveauSecuriteChoisiSuffisant(
    donnees: DonneesPourEstimationNiveauSecurite & {
      niveauSecurite: NiveauSecurite;
    }
  ) {
    const niveauMinimal = DescriptionService.estimeNiveauDeSecurite(donnees);
    return (
      tousNiveauxSecurite.indexOf(donnees.niveauSecurite) >=
      tousNiveauxSecurite.indexOf(niveauMinimal)
    );
  }

  static valideDonneesCreation(donnees: DonneesDescriptionService) {
    if (!DescriptionService.proprietesObligatoiresRenseignees(donnees)) {
      throw new ErreurDonneesObligatoiresManquantes(
        'Certaines données obligatoires ne sont pas renseignées'
      );
    }

    if (!DescriptionService.niveauSecuriteChoisiSuffisant(donnees)) {
      throw new ErreurDonneesNiveauSecuriteInsuffisant();
    }
  }
}

export default DescriptionService;
