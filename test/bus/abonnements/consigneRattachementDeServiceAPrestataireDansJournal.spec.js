const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneRattachementDeServiceAPrestataireDansJournal,
} = require('../../../src/bus/abonnements/consigneRattachementDeServiceAPrestataireDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) le rattachement d'un service à un prestataire", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "rattachement de service à un prestataire"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneRattachementDeServiceAPrestataireDansJournal({
      adaptateurJournal,
    })({
      idService: 'S1',
      codePrestataire: 'PRESTA',
    });

    expect(evenementRecu.type).to.be('SERVICE_RATTACHE_A_PRESTATAIRE');
  });
});
