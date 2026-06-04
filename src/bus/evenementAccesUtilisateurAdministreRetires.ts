import { UUID } from '../typesBasiques.js';

export class EvenementAccesUtilisateurAdministreRetires {
  public readonly idAdmin: UUID;
  public readonly idUtilisateurAdministre: UUID;
  public readonly idsServices: UUID[];

  constructor({
    idAdmin,
    idUtilisateurAdministre,
    idsServices,
  }: {
    idAdmin: UUID;
    idUtilisateurAdministre: UUID;
    idsServices: UUID[];
  }) {
    this.idAdmin = idAdmin;
    this.idUtilisateurAdministre = idUtilisateurAdministre;
    this.idsServices = idsServices;
  }
}
