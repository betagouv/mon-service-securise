const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const { unService } = require('../../constructeurs/constructeurService');
const {
  consigneRisquesDansJournal,
} = require('../../../src/bus/abonnements/consigneRisquesDansJournal');

describe("L'abonnement qui consigne les risques dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de changement des risques du service', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneRisquesDansJournal({
      adaptateurJournal,
    })({
      service: unService().construis(),
    });

    expect(evenementRecu.type).to.equal('RISQUES_SERVICE_MODIFIES');
    expect(evenementRecu.donnees).to.eql({
      idService: evenementRecu.donnees.idService,
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
