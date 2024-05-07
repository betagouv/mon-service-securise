const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  [
    '/',
    '/aPropos',
    '/securite',
    '/accessibilite',
    '/cgu',
    '/confidentialite',
    '/mentionsLegales',
    '/statistiques',
    '/inscription',
    '/activation',
    '/connexion',
    '/reinitialisationMotDePasse',
  ].forEach((route) => {
    it(`sert le contenu HTML de la page ${route}`, (done) => {
      axios
        .get(`http://localhost:1234${route}`)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.headers['content-type']).to.contain('text/html');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/connexion',
          done
        );
    });
  });

  describe('quand requête GET sur `/reinitialisationMotDePasse`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/reinitialisationMotDePasse',
          done
        );
    });
  });
});
