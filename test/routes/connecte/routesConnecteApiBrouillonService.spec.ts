import testeurMSS from '../testeurMSS.js';

describe('Le serveur MSS des routes /api/brouillon-service/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête POST sur /api/brouillon-service', () => {
    it('crée un brouillon de service et retourne son id', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });

      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: 'Le service',
      });

      expect(resultat.body.id).toBeDefined();
    });
  });
});
