import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../src/modeles/descriptionServiceV2.js';

class ConstructeurDescriptionServiceV2 {
  private donnees: DonneesDescriptionServiceV2;

  constructor() {
    this.donnees = {
      nomService: 'Service A',
      niveauDeSecurite: 'niveau1',
      organisationResponsable: { siret: '11112222333344' },
      categorieDonneesTraitees: 'donneesSensibles',
      volumetrieDonneesTraitees: 'moyen',
      statutDeploiement: 'enCours',
    };
  }

  construis(): DescriptionServiceV2 {
    return new DescriptionServiceV2(this.donnees);
  }
}

export const uneDescriptionV2Valide = () =>
  new ConstructeurDescriptionServiceV2();
