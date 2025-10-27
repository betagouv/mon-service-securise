import {
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
} from '../donneesReferentielMesuresV2.js';

export class ReferentielV2 {
  constructor(private readonly donnees: typeof questionsV2 = questionsV2) {
    this.donnees = donnees;
  }

  localisationDonnees(localisation: LocalisationDonneesTraitees) {
    return this.donnees.localisationDonneesTraitees[localisation];
  }

  typeService(typeService: TypeDeService) {
    return this.donnees.typeDeService[typeService];
  }

  descriptionStatutDeploiement(statutDeploiement: StatutDeploiement) {
    return this.donnees.statutDeploiement[statutDeploiement].description;
  }

  descriptionSpecificiteProjet(specificiteProjet: SpecificiteProjet) {
    return this.donnees.specificiteProjet[specificiteProjet].nom;
  }

  descriptionDelaiAvantImpactCritique(
    delaiAvantImpactCritique: DureeDysfonctionnementAcceptable
  ) {
    return this.donnees.dureeDysfonctionnementAcceptable[
      delaiAvantImpactCritique
    ].nom;
  }
}
