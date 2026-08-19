import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import ParcoursUtilisateur from '../../../src/modeles/parcoursUtilisateur.js';

describe('Le serveur MSS des routes privées /api/visiteGuidee/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  it("vérifie que l'utilisateur est authentifié sur toutes les routes", async () => {
    // On vérifie une seule route privée.
    // Par construction, les autres seront protégées aussi puisque la protection est ajoutée comme middleware
    // devant le routeur dédié aux routes de la visite guidée.
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'post',
        url: '/api/visiteGuidee/termine',
      });
  });

  describe('quand requête POST sur /visiteGuidee/termine', () => {
    it("sauvegarde l'état 'finalisé' de la visite guidée", async () => {
      testeur.depotDonnees().lisParcoursUtilisateur = () =>
        new ParcoursUtilisateur({
          etatVisiteGuidee: { dejaTerminee: false },
        });
      let parcoursUtilisateurPasse;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur
      ) => {
        parcoursUtilisateurPasse = parcoursUtilisateur;
      };

      await testeur.post('/api/visiteGuidee/termine');

      expect(parcoursUtilisateurPasse.etatVisiteGuidee.toJSON()).to.eql({
        dejaTerminee: true,
      });
    });
  });
});
