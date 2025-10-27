import {
  LocalisationDonneesTraitees,
  questionsV2,
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
}
