import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementGroupeServicesCreeJournal from '../../modeles/journalMSS/evenementGroupeServicesCree.js';
import { EvenementGroupeServicesCree } from '../evenementGroupeServicesCree.js';

export const consigneGroupeServicesCreeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ groupe }: EvenementGroupeServicesCree) => {
    const { id, idUtilisateur } = groupe.donnees();

    const evenement = new EvenementGroupeServicesCreeJournal({
      idGroupe: id,
      idUtilisateur,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
