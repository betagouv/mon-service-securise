const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  it("sert la page d'accueil", (done) => {
    axios
      .get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
        done();
      })
      .catch(done);
  });
});
