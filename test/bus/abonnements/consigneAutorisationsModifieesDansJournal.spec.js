const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneAutorisationsModifieesDansJournal,
} = require('../../../src/bus/abonnements/consigneAutorisationsModifieesDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) la modification d'autorisations pour un service", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it("consigne un événement de 'collaboratif de service modifié' indiquant le résumé des autorisations du service", async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneAutorisationsModifieesDansJournal({ adaptateurJournal })({
      idService: 'S1',
      autorisations: [{ droit: 'PROPRIETAIRE', idUtilisateur: 'U1' }],
    });

    expect(evenementRecu.type).to.be('COLLABORATIF_SERVICE_MODIFIE');
    const { autorisations } = evenementRecu.donnees;
    expect(autorisations.length).to.be(1);
    expect(autorisations[0].idUtilisateur).not.to.be(undefined);
    expect(autorisations[0].droit).to.be('PROPRIETAIRE');
  });

  it("lève une exception s'il ne reçoit pas d'ID de service", async () => {
    try {
      await consigneAutorisationsModifieesDansJournal({ adaptateurJournal })({
        idService: null,
        autorisations: [{ droit: 'PROPRIETAIRE', idUtilisateur: 'U1' }],
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner des autorisations modifées dans le journal MSS sans avoir l'ID du service en paramètre."
      );
    }
  });

  it("lève une exception s'il ne reçoit pas d'autorisations", async () => {
    try {
      await consigneAutorisationsModifieesDansJournal({ adaptateurJournal })({
        idService: 'S1',
        autorisations: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner des autorisations modifées dans le journal MSS sans avoir les autorisations en paramètre.'
      );
    }
  });
});
