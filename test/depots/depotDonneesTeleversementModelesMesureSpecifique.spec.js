const expect = require('expect.js');
const DepotDonneesTeleversementModelesMesureSpecifique = require('../../src/depots/depotDonneesTeleversementModelesMesureSpecifique');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');

describe('Le dépôt de données des téléversements de modèles de mesure spécifique', () => {
  let persistance;
  let chiffrement;

  beforeEach(() => {
    chiffrement = {
      chiffre: (donnees) => ({ ...donnees, chiffrees: true }),
    };
    persistance = unePersistanceMemoire().construis();
  });

  const leDepot = () =>
    DepotDonneesTeleversementModelesMesureSpecifique.creeDepot({
      adaptateurPersistance: persistance,
      adaptateurChiffrement: chiffrement,
    });

  describe('sur un nouveau téléversement', () => {
    it('persiste en chiffrant les données', async () => {
      let donneesPersistees;
      persistance.ajouteTeleversementModelesMesureSpecifique = async (
        idUtilisateur,
        donnees
      ) => {
        donneesPersistees = { idUtilisateur, donnees };
      };

      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', {
        description: 'la mesure téléversée',
      });

      expect(donneesPersistees).to.eql({
        idUtilisateur: 'U1',
        donnees: { description: 'la mesure téléversée', chiffrees: true },
      });
    });
  });

  describe("sur demande de suppression du téléversement d'un utilisateur", () => {
    it('supprime le téléversement', async () => {
      const depot = leDepot();
      await depot.nouveauTeleversementModelesMesureSpecifique('U1', {
        description: 'la mesure téléversée',
      });

      await depot.supprimeTeleversementModelesMesureSpecifique('U1');

      const televersement =
        await depot.lisTeleversementModelesMesureSpecifique('U1');
      expect(televersement).to.be(undefined);
    });
  });
});
