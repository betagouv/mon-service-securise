import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementCleApiCreeeJournal from '../../modeles/journalMSS/evenementCleApiCreee.js';
import { EvenementCleApiCreee } from '../evenementCleApiCreee.js';

export const consigneCleApiCreeeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ cle, dureeValiditeEnJours }: EvenementCleApiCreee) => {
    const { id, idUtilisateur, dateCreation, dateExpiration } = cle.donnees();

    const evenement = new EvenementCleApiCreeeJournal({
      idCle: id,
      idUtilisateur,
      dureeValiditeEnJours,
      dateCreation,
      dateExpiration,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
