const expect = require('expect.js');
const {
  metAJourContactBrevo,
} = require('../../../src/bus/abonnements/metAJourContactBrevo');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');

describe("L'abonnement qui met à jour le contact Brevo", () => {
  let crmBrevo;
  let utilisateur;
  let depotDonnees;

  beforeEach(() => {
    utilisateur = unUtilisateur()
      .avecEmail('jean.dujardin@beta.gouv.com')
      .construis();
    depotDonnees = {
      autorisations: async () => [],
    };
    crmBrevo = {
      metAJourContact: async () => {},
    };
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await metAJourContactBrevo({
        crmBrevo,
        depotDonnees,
      })({
        utilisateur: null,
      });

      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });

  it("délègue au CRM Brevo la mise à jour du contact avec l'utilisateur et les autorisations", async () => {
    const autorisations = [
      uneAutorisation().deProprietaire(utilisateur.id, '1').construis(),
      uneAutorisation().deContributeur(utilisateur.id, '2').construis(),
      uneAutorisation().deProprietaire(utilisateur.id, '3').construis(),
    ];
    depotDonnees.autorisations = async () => autorisations;
    let utilisateurRecu;
    let autorisationsRecues;
    crmBrevo.metAJourNombresContributionsContact = async (u, a) => {
      utilisateurRecu = u;
      autorisationsRecues = a;
    };

    await metAJourContactBrevo({
      crmBrevo,
      depotDonnees,
    })({
      utilisateur,
    });

    expect(utilisateurRecu).to.eql(utilisateur);
    expect(autorisationsRecues).to.eql(autorisations);
  });
});
