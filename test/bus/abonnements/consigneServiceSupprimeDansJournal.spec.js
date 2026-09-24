import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { consigneServiceSupprimeDansJournal } from '../../../src/bus/abonnements/consigneServiceSupprimeDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) la suppression d'un service", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "service supprimé"', async () => {
    await consigneServiceSupprimeDansJournal({ adaptateurJournal })({
      idService: '123',
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'SERVICE_SUPPRIME'
    );
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
