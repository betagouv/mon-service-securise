const Utilisateur = require('../../src/modeles/utilisateur.js');
const { fabriqueAnnuaire } = require('../../src/annuaire/serviceAnnuaire.ts');

describe("Le service d'annuaire", () => {
  describe('sur demande de contributeurs', () => {
    it('délègue au dépôt de données la recherche de contributeurs', async () => {
      const depotDonnees = {
        rechercheContributeurs: async () => [
          new Utilisateur({ id: '123', email: 'jean.dujardin@beta.gouv.fr' }),
        ],
      };

      const annuaire = fabriqueAnnuaire({ depotDonnees });

      const contributeurs = await annuaire.rechercheContributeurs('X', 'Y');

      expect(contributeurs.length).toBe(1);
      expect(contributeurs[0]).toBeInstanceOf(Utilisateur);
    });
  });
});
