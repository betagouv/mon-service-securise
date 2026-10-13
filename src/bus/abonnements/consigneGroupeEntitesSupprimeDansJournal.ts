import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementGroupeEntitesSupprimeJournal from '../../modeles/journalMSS/evenementGroupeEntitesSupprime.js';
import { EvenementGroupeEntitesSupprime } from '../evenementGroupeEntitesSupprime.js';

export const consigneGroupeEntitesSupprimeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ groupe }: EvenementGroupeEntitesSupprime) => {
    const { id, idUtilisateur } = groupe.donnees();

    const evenement = new EvenementGroupeEntitesSupprimeJournal({
      idGroupe: id,
      idUtilisateur,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
