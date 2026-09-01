import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementNotificationTransactionnelleModifieeJournal from '../../modeles/journalMSS/evenementNotificationTransactionnelleModifiee.js';
import { EvenementNotificationTransactionnelleModifiee } from '../evenementNotificationTransactionnelleModifiee.js';

export const consigneNotificationTransactionnelleModifieeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({
    notification,
    etat,
  }: EvenementNotificationTransactionnelleModifiee) => {
    const { id, type } = notification.donnees();

    const evenement = new EvenementNotificationTransactionnelleModifieeJournal({
      idNotification: id,
      typeNotification: type,
      etat,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
