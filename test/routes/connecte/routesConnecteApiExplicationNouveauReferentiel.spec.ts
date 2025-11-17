import testeurMSS from '../testeurMSS.js';
import ParcoursUtilisateur from '../../../src/modeles/parcoursUtilisateur.js';

describe('Le serveur MSS des routes privées /api/explicationNouveauReferentiel/*', () => {
  const testeur = testeurMSS();

  beforeEach(async () => {
    await testeur.initialise();
    testeur.depotDonnees().lisParcoursUtilisateur = () =>
      new ParcoursUtilisateur(
        {
          explicationNouveauReferentiel: { dejaTermine: false },
        },
        testeur.referentiel()
      );
  });

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", async () => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes de la visite guidée.
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'post',
        url: '/api/explicationNouveauReferentiel/termine',
      });
  });

  describe('quand requête POST sur /explicationNouveauReferentiel/termine', () => {
    it("sauvegarde l'état 'finalisé' de l'explication du nouveau référentiel", async () => {
      let parcoursUtilisateurRecu: ParcoursUtilisateur | undefined;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur: ParcoursUtilisateur
      ) => {
        parcoursUtilisateurRecu = parcoursUtilisateur;
      };

      await testeur.post('/api/explicationNouveauReferentiel/termine');

      expect(
        parcoursUtilisateurRecu!.explicationNouveauReferentiel.dejaTermine
      ).toBe(true);
    });
  });
});
