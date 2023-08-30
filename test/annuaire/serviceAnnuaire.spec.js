const expect = require('expect.js');
const Utilisateur = require('../../src/modeles/utilisateur');
const { fabriqueAnnuaire } = require('../../src/annuaire/serviceAnnuaire');

describe("Le service d'annuaire", () => {
  describe('sur demande de contributeurs', () => {
    it('retourne des Utilisateurs du domaine', async () => {
      const bouchonPersistance = {
        rechercheContributeurs: async () => [
          { id: '123', email: 'jean.dujardin@beta.gouv.fr' },
        ],
      };

      const annuaire = fabriqueAnnuaire({
        adaptateurPersistance: bouchonPersistance,
      });

      const contributeurs = await annuaire.rechercheContributeurs('X', 'Y');

      expect(contributeurs.length).to.be(1);
      expect(contributeurs[0]).to.be.an(Utilisateur);
    });
  });
});
