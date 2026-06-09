import { UUID } from '../typesBasiques.js';

export class EvenementAdminNommeSurOrganisation {
  public readonly idActeur: UUID;
  public readonly idCible: UUID;
  public readonly siret: string;

  constructor({
    idActeur,
    idCible,
    siret,
  }: {
    idActeur: UUID;
    idCible: UUID;
    siret: string;
  }) {
    this.idActeur = idActeur;
    this.idCible = idCible;
    this.siret = siret;
  }
}
