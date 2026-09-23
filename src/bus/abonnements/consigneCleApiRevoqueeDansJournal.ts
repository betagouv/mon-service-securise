import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementCleApiRevoqueeJournal from '../../modeles/journalMSS/evenementCleApiRevoquee.js';
import { EvenementCleApiRevoquee } from '../evenementCleApiRevoquee.js';

export const consigneCleApiRevoqueeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ cle }: EvenementCleApiRevoquee) => {
    const { id, idUtilisateur, dateRevocation } = cle.donnees();

    const evenement = new EvenementCleApiRevoqueeJournal({
      idCle: id,
      idUtilisateur,
      dateRevocation: dateRevocation!,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
