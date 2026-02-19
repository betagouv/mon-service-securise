import type Service from '../service.js';
import { ReferentielV2 } from '../../referentiel.interface.js';
import { DescriptionServiceV2 } from '../descriptionServiceV2.js';

export type ServiceV2 = Omit<Service, 'descriptionService' | 'referentiel'> & {
  descriptionService: DescriptionServiceV2;
  referentiel: ReferentielV2;
};

export class ObjetPDFAnnexeDescriptionV2 {
  private readonly referentiel: ReferentielV2;

  constructor(private readonly service: ServiceV2) {
    this.referentiel = service.referentiel;
  }

  donnees() {
    const { descriptionService } = this.service;
    const { organisationResponsable } = descriptionService;
    return {
      caracteristiques: [
        this.metEnForme(
          'Type de projet à sécuriser',
          descriptionService.typeService.map((t) =>
            this.referentiel.descriptionTypeService(t)
          )
        ),
        this.metEnForme(
          'Sécurisation prévues',
          descriptionService.specificitesProjet.map((s) =>
            this.referentiel.descriptionSpecificiteProjet(s)
          )
        ),
        this.metEnForme(
          'Hébergement du système',
          this.referentiel.descriptionTypeHebergement(
            descriptionService.typeHebergement
          )
        ),
      ],
      criticiteExposition: [
        this.metEnForme(
          'Ouverture du système',
          this.referentiel.descriptionOuvertureSysteme(
            descriptionService.ouvertureSysteme
          )
        ),
        this.metEnForme(
          'Audience cible du projet',
          this.referentiel.descriptionAudienceCible(
            descriptionService.audienceCible
          )
        ),
        this.metEnForme(
          'Durée maximale acceptable de dysfonctionnement du système',
          this.referentiel.descriptionDelaiAvantImpactCritique(
            descriptionService.dureeDysfonctionnementAcceptable
          )
        ),
        this.metEnForme('Données traitées', [
          ...descriptionService.categoriesDonneesTraitees.map((c) =>
            this.referentiel.descriptionsDonneesCaracterePersonnel(c)
          ),
          ...descriptionService.categoriesDonneesTraiteesSupplementaires,
        ]),
      ],
      informationsGeneriques: [
        this.metEnForme('Nom du projet', this.service.nomService()),
        this.metEnForme(
          "Nom de l'organisation",
          `${organisationResponsable.nom} (${organisationResponsable.siret})`
        ),
        this.metEnForme(
          'Statut',
          this.referentiel.descriptionStatutDeploiement(
            descriptionService.statutDeploiement
          )
        ),
        this.metEnForme('Présentation', descriptionService.presentation),
        this.metEnForme(
          'URL(s) du projet',
          descriptionService.pointsAcces.descriptions()
        ),
      ],
      nomService: this.service.nomService(),
      versionService: this.service.version(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private metEnForme(label: string, valeur: unknown) {
    return { label, valeur };
  }
}
