const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('./routes/testeurMSS');

describe('Le serveur MSS', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  it('utilise un filtrage IP pour ne servir que les IP autorisées', (done) => {
    testeur.middleware().verifieFiltrageIp('http://localhost:1234', done);
  });

  describe('quand une page est servie', () => {
    it('positionne les headers', (done) => {
      testeur
        .middleware()
        .verifieRequetePositionneHeaders('http://localhost:1234/', done);
    });

    it("n'affiche pas d'information sur la nature du serveur", (done) => {
      axios
        .get('http://localhost:1234')
        .then((reponse) => {
          expect(reponse.headers).to.not.have.property('x-powered-by');
          done();
        })
        .catch(done);
    });

    it("repousse l'expiration du cookie", (done) => {
      testeur
        .middleware()
        .verifieRequeteRepousseExpirationCookie('http://localhost:1234/', done);
    });
  });
});
