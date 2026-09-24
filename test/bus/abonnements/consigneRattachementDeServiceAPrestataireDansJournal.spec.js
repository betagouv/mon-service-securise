import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { consigneRattachementDeServiceAPrestataireDansJournal } from '../../../src/bus/abonnements/consigneRattachementDeServiceAPrestataireDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) le rattachement d'un service à un prestataire", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "rattachement de service à un prestataire"', async () => {
    await consigneRattachementDeServiceAPrestataireDansJournal({
      adaptateurJournal,
    })({
      idService: 'S1',
      codePrestataire: 'PRESTA',
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'SERVICE_RATTACHE_A_PRESTATAIRE'
    );
  });
});
