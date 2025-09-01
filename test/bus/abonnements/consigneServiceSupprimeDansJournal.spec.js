import expect from 'expect.js';
import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import { consigneServiceSupprimeDansJournal } from '../../../src/bus/abonnements/consigneServiceSupprimeDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) la suppression d'un service", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "service supprimé"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneServiceSupprimeDansJournal({ adaptateurJournal })({
      idService: '123',
    });

    expect(evenementRecu.type).to.be('SERVICE_SUPPRIME');
  });

  it("lève une exception s'il ne reçoit pas l'ID du service", async () => {
    try {
      await consigneServiceSupprimeDansJournal({ adaptateurJournal })({
        idService: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner la suppression d'un service sans avoir l'ID du service en paramètre."
      );
    }
  });
});
