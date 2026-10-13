import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementEntitesDuGroupeModifieesJournal from '../../modeles/journalMSS/evenementEntitesDuGroupeModifiees.js';
import { EvenementEntitesDuGroupeModifiees } from '../evenementEntitesDuGroupeModifiees.js';

export const consigneEntitesDuGroupeModifieesDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({ groupe }: EvenementEntitesDuGroupeModifiees) => {
    const { id, idUtilisateur, siretsAssocies } = groupe.donnees();

    const evenement = new EvenementEntitesDuGroupeModifieesJournal({
      idGroupe: id,
      idUtilisateur,
      nombreEntitesAssociees: siretsAssocies.length,
    });

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
