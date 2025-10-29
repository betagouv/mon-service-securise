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
    return {
      donneesStockees: [
        ...this.service.descriptionService.categoriesDonneesTraitees.map((c) =>
          this.referentiel.descriptionsDonneesCaracterePersonnel(c)
        ),
        ...this.service.descriptionService
          .categoriesDonneesTraiteesSupplementaires,
      ],
      dureeDysfonctionnementMaximumAcceptable:
        this.referentiel.descriptionDelaiAvantImpactCritique(
          this.service.descriptionService.dureeDysfonctionnementAcceptable
        ),
      nomService: this.service.nomService(),
      versionService: this.service.version(),
      specificitesProjet:
        this.service.descriptionService.specificitesProjet.map((s) =>
          this.referentiel.descriptionSpecificiteProjet(s)
        ),
    };
  }
}
