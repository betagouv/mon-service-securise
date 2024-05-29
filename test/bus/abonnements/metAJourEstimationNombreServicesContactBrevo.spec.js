const expect = require('expect.js');
const {
  metAJourEstimationNombreServicesContactBrevo,
} = require('../../../src/bus/abonnements/metAJourEstimationNombreServicesContactBrevo');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe("L'abonnement qui met à jour l'estimation du nombre de services du contact Brevo", () => {
  let crmBrevo;
  let utilisateur;

  beforeEach(() => {
    utilisateur = unUtilisateur()
      .avecEmail('jean.dujardin@beta.gouv.com')
      .avecEstimationNombreServices(1, 10)
      .construis();
    crmBrevo = {
      metAJourEstimationNombreServicesContact: async () => {},
    };
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await metAJourEstimationNombreServicesContactBrevo({ crmBrevo })({
        utilisateur: null,
      });

      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer à Brevo l'estimation du nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });

  it("délègue au CRM Brevo la mise à jour de l'estimation du nombre de services du contact", async () => {
    let utilisateurRecu;
    crmBrevo.metAJourEstimationNombreServicesContact = async (u) => {
      utilisateurRecu = u;
    };

    await metAJourEstimationNombreServicesContactBrevo({ crmBrevo })({
      utilisateur,
    });

    expect(utilisateurRecu).to.eql(utilisateur);
  });
});
