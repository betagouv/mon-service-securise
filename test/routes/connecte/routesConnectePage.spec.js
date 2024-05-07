const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des pages pour un utilisateur "Connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  ['/motDePasse/edition'].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = { accepteCGU: () => true };
        testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateur);
      });

      it("vérifie que l'utilisateur est authentifié", (done) => {
        testeur
          .middleware()
          .verifieRequeteExigeJWT(`http://localhost:1234${route}`, done);
      });

      it('sert le contenu HTML de la page', (done) => {
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
  });
});
