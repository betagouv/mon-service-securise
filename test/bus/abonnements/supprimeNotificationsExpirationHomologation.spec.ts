const expect = require('expect.js');
const {
  supprimeNotificationsExpirationHomologation,
} = require('../../../src/bus/abonnements/supprimeNotificationsExpirationHomologation');

describe("L'abonnement qui supprime (en base de données) les notifications d'expiration d'une homologation", () => {
  let depotDonnees;

  beforeEach(() => {
    depotDonnees = {
      supprimeNotificationsExpirationHomologationPourService: async () => {},
    };
  });

  it("lève une exception s'il ne reçoit pas l'ID du service", async () => {
    try {
      await supprimeNotificationsExpirationHomologation({ depotDonnees })({
        idService: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de supprimer les notifications d'expiration d'un dossier d'homologation sans avoir l'ID du service en paramètre."
      );
    }
  });

  it('demande au dépôt de supprimer les notifications existantes pour ce service', async () => {
    let depotAppele = false;
    depotDonnees.supprimeNotificationsExpirationHomologationPourService =
      async () => {
        depotAppele = true;
      };

    await supprimeNotificationsExpirationHomologation({ depotDonnees })({
      idService: '123',
    });

    expect(depotAppele).to.be(true);
  });
});
