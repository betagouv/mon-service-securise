const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./routes/testeurMSS');
const { unUtilisateur } = require('./constructeurs/constructeurUtilisateur');

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

  describe('quand requête GET sur `/visiteGuidee/:idEtape`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      const utilisateur = unUtilisateur().quiAccepteCGU().construis();
      testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateur);
      testeur
        .middleware()
        .verifieRequeteExigeJWT(
          'http://localhost:1234/visiteGuidee/decrire',
          done
        );
    });

    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/visiteGuidee/decrire',
          done
        );
    });

    it("charge l'état de la visite guidée", (done) => {
      testeur
        .middleware()
        .verifieRequeteChargeEtatVisiteGuidee(
          'http://localhost:1234/visiteGuidee/decrire',
          done
        );
    });

    ['decrire', 'securiser', 'homologuer', 'piloter'].forEach((idEtape) => {
      it(`rend une vue '.pug' correspondant à l'étape '${idEtape}'`, async () => {
        testeur.referentiel().recharge({
          etapesParcoursHomologation: [{ numero: 1 }],
        });
        const reponse = await axios.get(
          `http://localhost:1234/visiteGuidee/${idEtape}`
        );
        expect(reponse.status).to.be(200);
      });
    });
  });
});
