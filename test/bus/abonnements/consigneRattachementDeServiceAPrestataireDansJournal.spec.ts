import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneRattachementDeServiceAPrestataireDansJournal } from '../../../src/bus/abonnements/consigneRattachementDeServiceAPrestataireDansJournal.ts';
import { EvenementServiceRattacheAPrestataire } from '../../../src/bus/evenementServiceRattacheAPrestataire.js';

describe("L'abonnement qui consigne (dans le journal MSS) le rattachement d'un service à un prestataire", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "rattachement de service à un prestataire"', async () => {
    await consigneRattachementDeServiceAPrestataireDansJournal({
      adaptateurJournal,
    })(
      new EvenementServiceRattacheAPrestataire({
        idService: 'S1',
        codePrestataire: 'PRESTA',
      })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'SERVICE_RATTACHE_A_PRESTATAIRE'
    );
  });
});
