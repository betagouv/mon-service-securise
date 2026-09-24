import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneCompletudeDansJournal } from '../../../src/bus/abonnements/consigneCompletudeDansJournal.ts';

describe("L'abonnement qui consigne la complétude dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de changement de complétude du service', async () => {
    await consigneCompletudeDansJournal({ adaptateurJournal })({
      service: unService().construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'COMPLETUDE_SERVICE_MODIFIEE'
    );
  });
});
