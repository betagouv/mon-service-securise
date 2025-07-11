const expect = require('expect.js');
const DepotDonneesModelesMesureSpecifique = require('../../src/depots/depotDonneesModelesMesureSpecifique');

describe('Le dépôt de données des modèles de mesure spécifique', () => {
  describe("concernant l'ajout d'un modèle de mesure", () => {
    it('sait ajouter un modèle en chiffrant son contenu', async () => {
      let donneesPersistees = {};
      const adaptateurChiffrement = {
        chiffre: async (donnees) => ({ ...donnees, chiffree: true }),
      };
      const adaptateurPersistance = {
        ajouteModeleMesureSpecifique: async (
          idModele,
          idUtilisateur,
          donnees
        ) => {
          donneesPersistees = { idModele, idUtilisateur, donnees };
        },
      };
      const adaptateurUUID = {
        genereUUID: () => 'UUID-1',
      };

      const depot = DepotDonneesModelesMesureSpecifique.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurUUID,
      });

      await depot.ajouteModeleMesureSpecifique('U1', {
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
      });

      expect(donneesPersistees.idModele).to.be('UUID-1');
      expect(donneesPersistees.idUtilisateur).to.be('U1');
      expect(donneesPersistees.donnees).to.eql({
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
        chiffree: true,
      });
    });
  });
});
