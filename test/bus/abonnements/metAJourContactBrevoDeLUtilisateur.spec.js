const expect = require('expect.js');
const {
  metAJourContactBrevoDeLUtilisateur,
} = require('../../../src/bus/abonnements/metAJourContactBrevoDeLUtilisateur');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe("L'abonnement qui met à jour le contact Brevo de l'utilisateur", () => {
  let crmBrevo;
  let utilisateur;

  beforeEach(() => {
    utilisateur = unUtilisateur()
      .avecEmail('jean.dujardin@beta.gouv.com')
      .construis();
    crmBrevo = {
      metAJourContact: async () => {},
    };
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await metAJourContactBrevoDeLUtilisateur({
        crmBrevo,
      })({
        utilisateur: null,
      });

      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer à Brevo le profil utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });

  it('délègue au CRM Brevo la mise à jour du contact', async () => {
    let utilisateurRecu;
    crmBrevo.metAJourProfilContact = async (u) => {
      utilisateurRecu = u;
    };

    await metAJourContactBrevoDeLUtilisateur({
      crmBrevo,
    })({
      utilisateur,
    });

    expect(utilisateurRecu).to.eql(utilisateur);
  });
});
