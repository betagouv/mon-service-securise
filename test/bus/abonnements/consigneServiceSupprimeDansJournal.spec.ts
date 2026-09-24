import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneServiceSupprimeDansJournal } from '../../../src/bus/abonnements/consigneServiceSupprimeDansJournal.ts';
import EvenementServiceSupprime from '../../../src/bus/evenementServiceSupprime.js';

describe("L'abonnement qui consigne (dans le journal MSS) la suppression d'un service", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "service supprimé"', async () => {
    await consigneServiceSupprimeDansJournal({ adaptateurJournal })(
      new EvenementServiceSupprime({ idService: '123', autorisations: [] })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'SERVICE_SUPPRIME'
    );
  });
});
