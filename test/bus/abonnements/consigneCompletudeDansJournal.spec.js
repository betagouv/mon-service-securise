import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneCompletudeDansJournal } from '../../../src/bus/abonnements/consigneCompletudeDansJournal.js';

describe("L'abonnement qui consigne la complétude dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de changement de complétude du service', async () => {
    await consigneCompletudeDansJournal({
      adaptateurJournal,
    })({
      service: unService().construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.equal(
      'COMPLETUDE_SERVICE_MODIFIEE'
    );
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    try {
      await consigneCompletudeDansJournal({
        adaptateurJournal,
      })({
        service: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner la complétude dans le journal MSS sans avoir le service en paramètre.'
      );
    }
  });
});
