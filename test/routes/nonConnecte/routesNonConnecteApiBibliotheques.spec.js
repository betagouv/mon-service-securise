const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des routes /bibliotheques/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  it('retourne une erreur HTTP 404 si la bibliothèque est inconnue', async () => {
    await testeur.verifieRequeteGenereErreurHTTP(
      404,
      'Bibliothèque inconnue : bibliothequeInconnue.js',
      {
        method: 'get',
        url: '/bibliotheques/bibliothequeInconnue.js',
      }
    );
  });
});
