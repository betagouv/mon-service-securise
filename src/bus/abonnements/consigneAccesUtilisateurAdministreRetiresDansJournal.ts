import { EvenementAccesUtilisateurAdministreRetires as MssAccesUtilisateurAdministreRetires } from '../evenementAccesUtilisateurAdministreRetires.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementAccesUtilisateurAdministreRetires from '../../modeles/journalMSS/evenementAccesUtilisateurAdministreRetires.js';

const leveException = (raison: keyof MssAccesUtilisateurAdministreRetires) => {
  throw new Error(
    `Impossible de consigner un retrait d'accès à un utilisateur administré sans avoir ${raison} en paramètre.`
  );
};

export function consigneAccesUtilisateurAdministreRetiresDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: MssAccesUtilisateurAdministreRetires) => {
    const { idAdmin, idUtilisateurAdministre, idsServices } = evenement;

    if (!idAdmin) leveException('idAdmin');
    if (!idUtilisateurAdministre) leveException('idUtilisateurAdministre');
    if (!idsServices) leveException('idsServices');

    await adaptateurJournal.consigneEvenement(
      new EvenementAccesUtilisateurAdministreRetires({
        idAdmin,
        idUtilisateurAdministre,
        idsServices,
      }).toJSON()
    );
  };
}
