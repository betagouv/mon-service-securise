const expect = require('expect.js');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const { creeDepot } = require('../../src/depots/depotDonneesNotifications');

describe('Le dépôt de données des notifications', () => {
  let adaptateurPersistance;
  let depot;

  beforeEach(() => {
    adaptateurPersistance = unePersistanceMemoire().construis();
    depot = creeDepot({ adaptateurPersistance });
  });

  describe("sur demande de marquage d'une nouveauté comme lue", () => {
    it("délègue à l'adaptateur persistance le marquage", async () => {
      let donneesRecues;
      adaptateurPersistance.marqueNouveauteLue = async (
        idUtilisateur,
        idNouveaute
      ) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };
      await depot.marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });
});
