import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../src/modeles/descriptionServiceV2.js';
import {
  AudienceCible,
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  OuvertureSysteme,
  VolumetrieDonneesTraitees,
} from '../../donneesReferentielMesuresV2.js';

class ConstructeurDescriptionServiceV2 {
  private donnees: DonneesDescriptionServiceV2;

  constructor() {
    this.donnees = {
      activitesExternalisees: [],
      audienceCible: 'moyenne',
      categoriesDonneesTraiteesSupplementaires: [],
      dureeDysfonctionnementAcceptable: 'moinsDe4h',
      localisationsDonneesTraitees: [],
      ouvertureSysteme: 'accessibleSurInternet',
      pointsAcces: [],
      specificitesProjet: [],
      typeHebergement: 'cloud',
      typeService: [],
      nomService: 'Service A',
      niveauDeSecurite: 'niveau1',
      organisationResponsable: { siret: '11112222333344' },
      categoriesDonneesTraitees: ['donneesSensibles'],
      volumetrieDonneesTraitees: 'moyen',
      statutDeploiement: 'enCours',
      presentation: 'Le service A …',
    };
  }

  construis(): DescriptionServiceV2 {
    return new DescriptionServiceV2(this.donnees);
  }

  donneesDescription(): DonneesDescriptionServiceV2 {
    return this.donnees;
  }

  avecCategoriesDonneesTraitees(categories: CategorieDonneesTraitees[]) {
    this.donnees.categoriesDonneesTraitees = categories;
    return this;
  }

  avecAutresDonneesTraitees(donnees: string[]) {
    this.donnees.categoriesDonneesTraiteesSupplementaires = donnees;
    return this;
  }

  avecDureeDysfonctionnementAcceptable(
    duree: DureeDysfonctionnementAcceptable
  ) {
    this.donnees.dureeDysfonctionnementAcceptable = duree;
    return this;
  }

  avecVolumetrieDonneesTraitees(volumetrie: VolumetrieDonneesTraitees) {
    this.donnees.volumetrieDonneesTraitees = volumetrie;
    return this;
  }

  avecAudienceCible(audienceCible: AudienceCible) {
    this.donnees.audienceCible = audienceCible;
    return this;
  }

  avecOuvertureSysteme(ouvertureSysteme: OuvertureSysteme) {
    this.donnees.ouvertureSysteme = ouvertureSysteme;
    return this;
  }
}

export const uneDescriptionV2Valide = () =>
  new ConstructeurDescriptionServiceV2();
