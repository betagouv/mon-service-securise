import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementGroupeEntitesCreeJournal from '../../modeles/journalMSS/evenementGroupeEntitesCree.js';
import { EvenementGroupeEntitesCree } from '../evenementGroupeEntitesCree.js';

export const consigneGroupeEntitesCreeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ groupe }: EvenementGroupeEntitesCree) => {
    const { id, idUtilisateur } = groupe.donnees();

    const evenement = new EvenementGroupeEntitesCreeJournal({
      idGroupe: id,
      idUtilisateur,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
