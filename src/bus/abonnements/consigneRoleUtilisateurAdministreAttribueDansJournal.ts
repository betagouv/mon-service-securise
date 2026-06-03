import { EvenementRoleUtilisateurAdministreAttribue as MssRoleUtilisateurAdministreAttribue } from '../evenementRoleUtilisateurAdministreAttribue.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementRoleUtilisateurAdministreAttribue from '../../modeles/journalMSS/evenementRoleUtilisateurAdministreAttribue.js';

const leveException = (raison: keyof MssRoleUtilisateurAdministreAttribue) => {
  throw new Error(
    `Impossible de consigner une attribution de rôle à un utilisateur administré sans avoir ${raison} en paramètre.`
  );
};

export function consigneRoleUtilisateurAdministreAttribueDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: MssRoleUtilisateurAdministreAttribue) => {
    const { idAdmin, idUtilisateurAdministre, role, idsServices } = evenement;

    if (!idAdmin) leveException('idAdmin');
    if (!idUtilisateurAdministre) leveException('idUtilisateurAdministre');
    if (!role) leveException('role');
    if (!idsServices) leveException('idsServices');

    await adaptateurJournal.consigneEvenement(
      new EvenementRoleUtilisateurAdministreAttribue({
        idAdmin,
        idUtilisateurAdministre,
        role,
        idsServices,
      }).toJSON()
    );
  };
}
