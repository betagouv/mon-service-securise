import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { Role } from '../autorisations/autorisation.js';

class EvenementRoleUtilisateurAdministreAttribue extends Evenement {
  constructor(
    donnees: {
      idAdmin: UUID;
      idUtilisateurAdministre: UUID;
      role: Role;
      idsServices: UUID[];
    },
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idAdmin',
      'idUtilisateurAdministre',
      'role',
      'idsServices',
    ]);

    super(
      'ROLE_UTILISATEUR_ADMINISTRE_ATTRIBUE',
      {
        idAdmin: adaptateurChiffrement.hacheSha256(donnees.idAdmin),
        idUtilisateurAdministre: adaptateurChiffrement.hacheSha256(
          donnees.idUtilisateurAdministre
        ),
        role: donnees.role,
        idsServices: donnees.idsServices.map(adaptateurChiffrement.hacheSha256),
      },
      date
    );
  }
}

export default EvenementRoleUtilisateurAdministreAttribue;
