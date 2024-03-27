const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneServiceSupprimeDansJournal,
} = require('../../../src/bus/abonnements/consigneServiceSupprimeDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) la finalisation d'un dossier d'homologation", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "service supprimé"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneServiceSupprimeDansJournal({ adaptateurJournal })({
      idService: '123',
    });

    expect(evenementRecu.type).to.be('SERVICE_SUPPRIME');
  });

  it("lève une exception s'il ne reçoit pas l'ID du service", async () => {
    try {
      await consigneServiceSupprimeDansJournal({ adaptateurJournal })({
        idService: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner la suppression d'un service sans avoir l'ID du service en paramètre."
      );
    }
  });
});
