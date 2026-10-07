import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementGroupeServicesSupprimeJournal from '../../modeles/journalMSS/evenementGroupeServicesSupprime.js';
import { EvenementGroupeServicesSupprime } from '../evenementGroupeServicesSupprime.js';

export const consigneGroupeServicesSupprimeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ groupe }: EvenementGroupeServicesSupprime) => {
    const { id, idUtilisateur } = groupe.donnees();

    const evenement = new EvenementGroupeServicesSupprimeJournal({
      idGroupe: id,
      idUtilisateur,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
