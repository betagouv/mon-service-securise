import Utilisateur from '../../src/modeles/utilisateur.js';
import { fabriqueAnnuaire } from '../../src/annuaire/serviceAnnuaire';

describe("Le service d'annuaire", () => {
  describe('sur demande de contributeurs', () => {
    it('délègue au dépôt de données la recherche de contributeurs', async () => {
      const depotDonnees = {
        rechercheContributeurs: async () => [
          new Utilisateur({ id: '123', email: 'jean.dujardin@beta.gouv.fr' }),
        ],
      };

      const annuaire = fabriqueAnnuaire({
        depotDonnees,
        adaptateurRechercheEntreprise: {
          rechercheOrganisations: async () => [],
        },
      });

      const contributeurs = await annuaire.rechercheContributeurs(
        crypto.randomUUID(),
        'Y'
      );

      expect(contributeurs.length).toBe(1);
      expect(contributeurs[0]).toBeInstanceOf(Utilisateur);
    });
  });
});
