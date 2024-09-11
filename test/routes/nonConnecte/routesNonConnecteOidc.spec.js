const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { enObjet } = require('../../aides/cookie');

describe('Le serveur MSS des routes publiques /oidc/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => {
    testeur.initialise();
  });

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/oidc/connexion`', () => {
    beforeEach(() => {
      testeur.adaptateurOidc().genereDemandeAutorisation = async () => ({
        nonce: 'unNonce',
        state: 'unState',
        url: 'http',
      });
    });

    it('redirige vers la page d’autorisation', async () => {
      const reponse = await axios.get('http://localhost:1234/oidc/connexion', {
        validateStatus: () => true, // pour ne pas qu’un statut 302 lance une erreur
        maxRedirects: 0,
      });

      expect(reponse.status).to.be(302);
      expect(reponse.headers.location).to.be('http');
    });

    it('enrichit la session avec le nonce et le state', async () => {
      const reponse = await axios.get('http://localhost:1234/oidc/connexion', {
        validateStatus: () => true, // pour ne pas qu’un statut 302 lance une erreur
        maxRedirects: 0,
      });

      const cookieSession = enObjet(reponse.headers['set-cookie'][0]);
      const tokenDecode = Buffer.from(cookieSession.token, 'base64').toString();
      expect(JSON.parse(tokenDecode)).to.eql({
        state: 'unState',
        nonce: 'unNonce',
      });
    });
  });
});
