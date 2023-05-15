const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /bibliotheques/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  it('retourne une erreur HTTP 404 si la bibliothèque est inconnue', (done) => {
    testeur.verifieRequeteGenereErreurHTTP(
      404,
      'Bibliothèque inconnue : bibliothequeInconnue.js',
      {
        method: 'get',
        url: 'http://localhost:1234/bibliotheques/bibliothequeInconnue.js',
      },
      done
    );
  });
});
