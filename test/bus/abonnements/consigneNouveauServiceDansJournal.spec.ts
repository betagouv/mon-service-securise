const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const { unService } = require('../../constructeurs/constructeurService');
const {
  consigneNouveauServiceDansJournal,
} = require('../../../src/bus/abonnements/consigneNouveauServiceDansJournal');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe("L'abonnement qui consigne la création d'un nouveau service dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de nouveau service créé', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneNouveauServiceDansJournal({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

    expect(evenementRecu.type).to.equal('NOUVEAU_SERVICE_CREE');
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    try {
      await consigneNouveauServiceDansJournal({ adaptateurJournal })({
        service: null,
        utilisateur: unUtilisateur().avecId('ABC').construis(),
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner un nouveau service dans le journal MSS sans avoir le service en paramètre.'
      );
    }
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneNouveauServiceDansJournal({ adaptateurJournal })({
        service: unService().avecId('123').construis(),
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner un nouveau service dans le journal MSS sans avoir le créateur en paramètre.'
      );
    }
  });
});
