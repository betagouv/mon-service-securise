const expect = require('expect.js');
const DepotDonneesModelesMesureSpecifique = require('../../src/depots/depotDonneesModelesMesureSpecifique');

describe('Le dépôt de données des modèles de mesure spécifique', () => {
  let adaptateurChiffrement;
  let adaptateurUUID;
  let adaptateurPersistance;

  beforeEach(() => {
    adaptateurChiffrement = {
      chiffre: async (donnees) => ({ ...donnees, chiffree: true }),
    };
    adaptateurUUID = { genereUUID: () => 'UUID-1' };
  });

  const leDepot = () =>
    DepotDonneesModelesMesureSpecifique.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      adaptateurUUID,
    });

  describe("concernant l'ajout d'un modèle de mesure", () => {
    it('sait ajouter un modèle en chiffrant son contenu', async () => {
      let donneesPersistees = {};
      adaptateurPersistance = {
        ajouteModeleMesureSpecifique: async (
          idModele,
          idUtilisateur,
          donnees
        ) => {
          donneesPersistees = { idModele, idUtilisateur, donnees };
        },
      };

      const depot = leDepot();

      await depot.ajouteModeleMesureSpecifique('U1', {
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
      });

      expect(donneesPersistees.idModele).to.be('UUID-1');
      expect(donneesPersistees.idUtilisateur).to.be('U1');
      expect(donneesPersistees.donnees).to.eql({
        chiffree: true,
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
      });
    });
  });
});
