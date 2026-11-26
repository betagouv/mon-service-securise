import type Service from '../service.js';
import DescriptionService from '../descriptionService.js';
import { creeReferentielVide } from '../../referentiel.js';
import { Referentiel } from '../../referentiel.interface.js';
import {
  IdDelaiAvantImpactCritique,
  IdDonneeCaracterePersonnel,
  IdFonctionnalite,
} from '../../referentiel.types.js';

export type ServiceV1 = Omit<Service, 'descriptionService'> & {
  descriptionService: DescriptionService;
};

class ObjetPDFAnnexeDescription {
  private readonly service: ServiceV1;
  private readonly referentiel: Referentiel;

  constructor(
    service: ServiceV1,
    referentiel: Referentiel = creeReferentielVide()
  ) {
    this.referentiel = referentiel;
    this.service = service;
  }

  donnees() {
    const { descriptionService } = this.service;

    const fonctionnalites = this.referentiel.descriptionsFonctionnalites(
      descriptionService.fonctionnalites as IdFonctionnalite[]
    );
    const fonctionnalitesSpecifiques =
      descriptionService.fonctionnalitesSpecifiques.descriptions();

    const donneesStockees =
      this.referentiel.descriptionsDonneesCaracterePersonnel(
        descriptionService.donneesCaracterePersonnel as IdDonneeCaracterePersonnel[]
      );
    const donneesStockeesSpecifiques =
      descriptionService.donneesSensiblesSpecifiques.descriptions();

    const dureeDysfonctionnementMaximumAcceptable =
      this.referentiel.descriptionDelaiAvantImpactCritique(
        descriptionService.delaiAvantImpactCritique as IdDelaiAvantImpactCritique
      );

    return {
      nomService: this.service.nomService(),
      versionService: this.service.version(),
      fonctionnalites: [...fonctionnalites, ...fonctionnalitesSpecifiques],
      donneesStockees: [...donneesStockees, ...donneesStockeesSpecifiques],
      dureeDysfonctionnementMaximumAcceptable,
    };
  }
}

export default ObjetPDFAnnexeDescription;
