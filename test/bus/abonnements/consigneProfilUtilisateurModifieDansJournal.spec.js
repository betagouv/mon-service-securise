const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  consigneProfilUtilisateurModifieDansJournal,
} = require('../../../src/bus/abonnements/consigneProfilUtilisateurModifieDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) la mise à jour du profil d'un utilisateur", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "profil utilisateur modifié"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneProfilUtilisateurModifieDansJournal({ adaptateurJournal })({
      utilisateur: unUtilisateur().construis(),
    });

    expect(evenementRecu.type).to.be('PROFIL_UTILISATEUR_MODIFIE');
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneProfilUtilisateurModifieDansJournal({ adaptateurJournal })({
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner les mises à jour de profil utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
