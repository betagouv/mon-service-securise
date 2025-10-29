import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../src/modeles/descriptionServiceV2.js';
import {
  ActiviteExternalisee,
  AudienceCible,
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  NiveauSecurite,
  OuvertureSysteme,
  SpecificiteProjet,
  StatutDeploiement,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../../donneesReferentielMesuresV2.js';
import { TypeService } from '../../svelte/lib/creationV2/creationV2.types.js';

class ConstructeurDescriptionServiceV2 {
  private readonly donnees: Partial<DonneesDescriptionServiceV2>;

  constructor() {
    this.donnees = {
      activitesExternalisees: [],
      audienceCible: 'moyenne',
      categoriesDonneesTraiteesSupplementaires: [],
      dureeDysfonctionnementAcceptable: 'moinsDe4h',
      localisationsDonneesTraitees: ['UE'],
      ouvertureSysteme: 'accessibleSurInternet',
      pointsAcces: [],
      specificitesProjet: [],
      typeHebergement: 'cloud',
      typeService: ['api'],
      nomService: 'Service A',
      niveauSecurite: 'niveau3',
      organisationResponsable: { siret: '11112222333344' },
      categoriesDonneesTraitees: ['donneesSensibles'],
      volumetrieDonneesTraitees: 'moyen',
      statutDeploiement: 'enCours',
      presentation: 'Le service A …',
    };
  }

  construis(): DescriptionServiceV2 {
    return new DescriptionServiceV2(
      this.donnees as DonneesDescriptionServiceV2
    );
  }

  donneesDescription(): DonneesDescriptionServiceV2 {
    return this.donnees as DonneesDescriptionServiceV2;
  }

  avecCategoriesDonneesTraitees(categories: CategorieDonneesTraitees[]) {
    this.donnees.categoriesDonneesTraitees = categories;
    return this;
  }

  avecAutresDonneesTraitees(donnees: string[]) {
    this.donnees.categoriesDonneesTraiteesSupplementaires = donnees;
    return this;
  }

  avecVolumetrieDonneesTraitees(volumetrie: VolumetrieDonneesTraitees) {
    this.donnees.volumetrieDonneesTraitees = volumetrie;
    return this;
  }

  avecNomService(nom: string): ConstructeurDescriptionServiceV2 {
    this.donnees.nomService = nom;
    return this;
  }

  avecNiveauSecurite(
    niveauSecurite: NiveauSecurite | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.niveauSecurite = niveauSecurite;
    return this;
  }

  avecSiret(siret: string): ConstructeurDescriptionServiceV2 {
    this.donnees.organisationResponsable!.siret = siret;
    return this;
  }

  avecStatutDeploiement(
    statutDeploiement: StatutDeploiement | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.statutDeploiement = statutDeploiement;
    return this;
  }

  avecPresentation(presentation: string): ConstructeurDescriptionServiceV2 {
    this.donnees.presentation = presentation;
    return this;
  }

  avecTypesService(
    typeService: TypeService[]
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.typeService = typeService;
    return this;
  }

  avecTypeHebergement(
    typeHebergement: TypeHebergement | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.typeHebergement = typeHebergement;
    return this;
  }

  avecOuvertureSysteme(
    ouvertureSysteme: OuvertureSysteme | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.ouvertureSysteme = ouvertureSysteme;
    return this;
  }

  avecAudienceCible(
    audienceCible: AudienceCible | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.audienceCible = audienceCible;
    return this;
  }

  avecDureeDysfonctionnementAcceptable(
    duree: DureeDysfonctionnementAcceptable | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.dureeDysfonctionnementAcceptable = duree;
    return this;
  }

  avecVolumeDonneesTraitees(
    volume: VolumetrieDonneesTraitees | undefined
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.volumetrieDonneesTraitees = volume;
    return this;
  }

  avecLocalisationDonneesTraitees(
    localisations: LocalisationDonneesTraitees[]
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.localisationsDonneesTraitees = localisations;
    return this;
  }

  avecDonneesTraitees(
    categories: CategorieDonneesTraitees[],
    autresDonnees: string[]
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.categoriesDonneesTraitees = categories;
    this.donnees.categoriesDonneesTraiteesSupplementaires = autresDonnees;
    return this;
  }

  avecSpecificitesProjet(
    specificites: SpecificiteProjet[]
  ): ConstructeurDescriptionServiceV2 {
    this.donnees.specificitesProjet = specificites;
    return this;
  }

  quiExternalise(activites: ActiviteExternalisee[]) {
    this.donnees.activitesExternalisees = activites;
    return this;
  }
}

export const uneDescriptionV2Valide = () =>
  new ConstructeurDescriptionServiceV2();

export const uneDescriptionDeNiveauDeSecuriteEstime1 = () =>
  uneDescriptionV2Valide()
    .avecDureeDysfonctionnementAcceptable('plusDe24h')
    .avecCategoriesDonneesTraitees([])
    .avecNiveauSecurite('niveau1');

export const uneDescriptionDeNiveauDeSecuriteEstime3 = () =>
  uneDescriptionV2Valide()
    .avecDureeDysfonctionnementAcceptable('moinsDe4h')
    .avecCategoriesDonneesTraitees(['donneesSensibles'])
    .avecNiveauSecurite('niveau3');
