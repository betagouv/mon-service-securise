import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementRoleUtilisateurAdministreAttribue from '../../modeles/journalMSS/evenementRoleUtilisateurAdministreAttribue.js';
import { EvenementRoleUtilisateurAdministreAttribue as MssRoleUtilisateurAdministreAttribue } from '../evenementRoleUtilisateurAdministreAttribue.js';

const consigneRoleUtilisateurAdministreAttribueDansJournal =
  consigneDansJournal(
    ({
      idAdmin,
      idUtilisateurAdministre,
      role,
      idsServices,
    }: MssRoleUtilisateurAdministreAttribue) =>
      new EvenementRoleUtilisateurAdministreAttribue({
        idAdmin,
        idUtilisateurAdministre,
        role,
        idsServices,
      })
  );

export { consigneRoleUtilisateurAdministreAttribueDansJournal };
