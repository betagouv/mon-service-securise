const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe('Le serveur MSS des pages pour un utilisateur "Connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  [
    '/motDePasse/edition',
    '/motDePasse/initialisation',
    '/utilisateur/edition',
  ].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
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

  ['/tableauDeBord', '/historiqueProduit'].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      it("vérifie que l'utilisateur est authentifié", (done) => {
        testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(
            `http://localhost:1234${route}`,
            done
          );
      });

      it("vérifie que l'état de la visite guidée est chargé sur la route", (done) => {
        testeur
          .middleware()
          .verifieRequeteChargeEtatVisiteGuidee(
            `http://localhost:1234${route}`,
            done
          );
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
