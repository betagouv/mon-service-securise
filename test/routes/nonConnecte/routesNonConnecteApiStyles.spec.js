const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des routes /styles/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  it('retourne une erreur HTTP 404 si la feuille de style est inconnue', (done) => {
    testeur.verifieRequeteGenereErreurHTTP(
      404,
      'Feuille de style inconnue',
      {
        method: 'get',
        url: 'http://localhost:1234/styles/stylesInconnu.css',
      },
      done
    );
  });
});
