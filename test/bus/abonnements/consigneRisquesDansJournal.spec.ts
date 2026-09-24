import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneRisquesDansJournal } from '../../../src/bus/abonnements/consigneRisquesDansJournal.ts';

describe("L'abonnement qui consigne les risques dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de changement des risques du service', async () => {
    await consigneRisquesDansJournal({ adaptateurJournal })({
      service: unService().construis(),
    });

    const { type, donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(type).toBe('RISQUES_SERVICE_MODIFIES');
    expect(donnees).toEqual({
      idService: donnees.idService,
      risquesGeneraux: [],
      risquesSpecifiques: [],
    });
  });
});
