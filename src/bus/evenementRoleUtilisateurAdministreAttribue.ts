import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';
import { Role } from '../modeles/autorisations/autorisation.js';

type Donnees = {
  idAdmin: UUID;
  idUtilisateurAdministre: UUID;
  role: Role;
  idsServices: UUID[];
};

export class EvenementRoleUtilisateurAdministreAttribue extends EvenementMetier<Donnees>(
  ['idAdmin', 'idUtilisateurAdministre', 'role', 'idsServices']
) {}
