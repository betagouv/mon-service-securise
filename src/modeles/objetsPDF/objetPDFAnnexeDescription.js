import * as Referentiel from '../../referentiel.js';
import { VersionService } from '../versionService.js';

class ObjetPDFAnnexeDescription {
  constructor(service, referentiel = Referentiel.creeReferentielVide()) {
    this.referentiel = referentiel;
    this.service = service;
  }

  donnees() {
    const fonctionnalitesV1 = () => [
      ...this.referentiel.descriptionsFonctionnalites(
        this.service.descriptionService.fonctionnalites
      ),
      ...this.service.descriptionService.fonctionnalitesSpecifiques.descriptions(),
    ];

    const donneesV1 = () => [
      ...this.referentiel.descriptionsDonneesCaracterePersonnel(
        this.service.descriptionService.donneesCaracterePersonnel
      ),
      ...this.service.descriptionService.donneesSensiblesSpecifiques.descriptions(),
    ];

    const fonctionnalitesV2 = () =>
      this.service.descriptionService.specificitesProjet.map((s) =>
        this.referentiel.descriptionSpecificiteProjet(s)
      );

    const estServiceV2 = this.service.version() === VersionService.v2;

    const dureeDysfonctionnementMaximumAcceptable =
      this.referentiel.descriptionDelaiAvantImpactCritique(
        estServiceV2
          ? this.service.descriptionService.dureeDysfonctionnementAcceptable
          : this.service.descriptionService.delaiAvantImpactCritique
      );

    return {
      nomService: this.service.nomService(),
      fonctionnalites: estServiceV2 ? fonctionnalitesV2() : fonctionnalitesV1(),
      donneesStockees: estServiceV2 ? [] : donneesV1(),
      dureeDysfonctionnementMaximumAcceptable,
    };
  }
}

export default ObjetPDFAnnexeDescription;
