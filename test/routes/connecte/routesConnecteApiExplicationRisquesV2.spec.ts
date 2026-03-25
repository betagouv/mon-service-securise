import testeurMSS from '../testeurMSS.js';
import ParcoursUtilisateur from '../../../src/modeles/parcoursUtilisateur.js';

describe('Le serveur MSS des routes privées /api/explicationRisquesV2/*', () => {
  const testeur = testeurMSS();

  beforeEach(async () => {
    await testeur.initialise();
    testeur.depotDonnees().lisParcoursUtilisateur = () =>
      new ParcoursUtilisateur(
        // @ts-expect-error On ne se concentre que sur cette propriété
        { aVuExplicationRisquesV2: false },
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
        url: '/api/explicationRisquesV2/termine',
      });
  });

  describe('quand requête POST sur /explicationRisquesV2/termine', () => {
    it("sauvegarde l'état 'vu' de l'explication des risques V2", async () => {
      let parcoursUtilisateurRecu: ParcoursUtilisateur | undefined;
      testeur.depotDonnees().sauvegardeParcoursUtilisateur = (
        parcoursUtilisateur: ParcoursUtilisateur
      ) => {
        parcoursUtilisateurRecu = parcoursUtilisateur;
      };

      await testeur.post('/api/explicationRisquesV2/termine');

      expect(parcoursUtilisateurRecu!.aVuExplicationRisquesV2).toBe(true);
    });
  });
});
