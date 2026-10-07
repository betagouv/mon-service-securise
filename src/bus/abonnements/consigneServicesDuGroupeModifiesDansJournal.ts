import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementServicesDuGroupeModifiesJournal from '../../modeles/journalMSS/evenementServicesDuGroupeModifies.js';
import { EvenementServicesDuGroupeModifies } from '../evenementServicesDuGroupeModifies.js';

export const consigneServicesDuGroupeModifiesDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({
    groupe,
    nombreServicesAssocies,
  }: EvenementServicesDuGroupeModifies) => {
    const { id, idUtilisateur } = groupe.donnees();

    const evenement = new EvenementServicesDuGroupeModifiesJournal({
      idGroupe: id,
      idUtilisateur,
      nombreServicesAssocies,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
