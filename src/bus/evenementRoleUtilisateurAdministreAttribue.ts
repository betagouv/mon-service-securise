import { UUID } from '../typesBasiques.js';
import { Role } from '../modeles/autorisations/autorisation.js';

export class EvenementRoleUtilisateurAdministreAttribue {
  public readonly idAdmin: UUID;
  public readonly idUtilisateurAdministre: UUID;
  public readonly role: Role;
  public readonly idsServices: UUID[];

  constructor({
    idAdmin,
    idUtilisateurAdministre,
    role,
    idsServices,
  }: {
    idAdmin: UUID;
    idUtilisateurAdministre: UUID;
    role: Role;
    idsServices: UUID[];
  }) {
    this.idAdmin = idAdmin;
    this.idUtilisateurAdministre = idUtilisateurAdministre;
    this.role = role;
    this.idsServices = idsServices;
  }
}
