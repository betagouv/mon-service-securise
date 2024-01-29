const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const { unService } = require('../../constructeurs/constructeurService');
const {
  consigneCompletudeDansJournal,
} = require('../../../src/bus/abonnements/consigneCompletudeDansJournal');

describe("L'abonnement qui consigne la complétude dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de changement de complétude du service', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneCompletudeDansJournal({ adaptateurJournal })({
      service: unService().construis(),
    });

    expect(evenementRecu.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
  });
});
