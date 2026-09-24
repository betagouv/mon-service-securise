import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneRisquesDansJournal } from '../../../src/bus/abonnements/consigneRisquesDansJournal.js';

describe("L'abonnement qui consigne les risques dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de changement des risques du service', async () => {
    await consigneRisquesDansJournal({
      adaptateurJournal,
    })({
      service: unService().construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.equal(
      'RISQUES_SERVICE_MODIFIES'
    );
    expect(adaptateurJournal.dernierEvenementConsigne().donnees).to.eql({
      idService: adaptateurJournal.dernierEvenementConsigne().donnees.idService,
      risquesGeneraux: [],
      risquesSpecifiques: [],
    });
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    try {
      await consigneRisquesDansJournal({
        adaptateurJournal,
      })({
        service: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner les risques dans le journal MSS sans avoir le service en paramètre.'
      );
    }
  });
});
