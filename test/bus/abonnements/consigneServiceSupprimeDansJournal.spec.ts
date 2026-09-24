import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneServiceSupprimeDansJournal } from '../../../src/bus/abonnements/consigneServiceSupprimeDansJournal.ts';
import EvenementServiceSupprime from '../../../src/bus/evenementServiceSupprime.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne (dans le journal MSS) la suppression d'un service", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "service supprimé"', async () => {
    await consigneServiceSupprimeDansJournal({ adaptateurJournal })(
      new EvenementServiceSupprime({
        idService: unUUID('1'),
        autorisations: [],
      })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'SERVICE_SUPPRIME'
    );
  });
});
