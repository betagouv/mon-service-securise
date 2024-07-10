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

  describe('sur demande de la liste des tâches de service', () => {
    it('utiliser l’adaptateur de persistance pour récupérer toutes les tâches', async () => {
      let adaptateurAppele;
      let idUtilisateurUtilise;
      adaptateurPersistance.tachesDeServicePour = async (idUtilisateur) => {
        adaptateurAppele = true;
        idUtilisateurUtilise = idUtilisateur;
        return [];
      };

      await depot.tachesDesServices('U1');

      expect(adaptateurAppele).to.be(true);
      expect(idUtilisateurUtilise).to.be('U1');
    });
  });
});
