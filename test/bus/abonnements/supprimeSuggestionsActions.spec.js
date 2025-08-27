import expect from 'expect.js';
import { supprimeSuggestionsActions } from '../../../src/bus/abonnements/supprimeSuggestionsActions.js';

describe("L'abonnement qui supprime (en base de données) les suggestions d'actions d'un service", () => {
  let depotDonnees;

  beforeEach(() => {
    depotDonnees = {
      supprimeSuggestionsActionsPourService: async () => {},
    };
  });

  it("lève une exception s'il ne reçoit pas l'ID du service", async () => {
    try {
      await supprimeSuggestionsActions({ depotDonnees })({
        idService: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de supprimer les suggestions d'actions d'un service sans avoir l'ID du service en paramètre."
      );
    }
  });

  it("demande au dépôt de supprimer les suggestions d'actions pour ce service", async () => {
    let depotAppele = false;
    depotDonnees.supprimeSuggestionsActionsPourService = async () => {
      depotAppele = true;
    };

    await supprimeSuggestionsActions({ depotDonnees })({
      idService: '123',
    });

    expect(depotAppele).to.be(true);
  });
});
