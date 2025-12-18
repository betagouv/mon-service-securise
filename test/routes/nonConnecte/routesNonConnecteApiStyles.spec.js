import testeurMSS from '../testeurMSS.js';

describe('Le serveur MSS des routes /styles/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  it('retourne une erreur HTTP 404 si la feuille de style est inconnue', async () => {
    await testeur.verifieRequeteGenereErreurHTTP(
      404,
      'Feuille de style inconnue',
      { method: 'get', url: '/styles/stylesInconnu.css' }
    );
  });
});
