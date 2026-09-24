import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { Role } from '../autorisations/autorisation.js';

type Donnees = {
  idAdmin: UUID;
  idUtilisateurAdministre: UUID;
  role: Role;
  idsServices: UUID[];
};

class EvenementRoleUtilisateurAdministreAttribue extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'ROLE_UTILISATEUR_ADMINISTRE_ATTRIBUE';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idAdmin', 'idUtilisateurAdministre', 'role', 'idsServices'];
  }

  protected override donneesAConsigner(
    { idAdmin, idUtilisateurAdministre, role, idsServices }: Donnees,
    hache: Hacheur
  ) {
    return {
      idAdmin: hache(idAdmin),
      idUtilisateurAdministre: hache(idUtilisateurAdministre),
      role,
      idsServices: idsServices.map(hache),
    };
  }
}

export default EvenementRoleUtilisateurAdministreAttribue;
