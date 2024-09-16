const expect = require('expect.js');
const { requeteSansRedirection } = require('../../aides/http');
const testeurMSS = require('../testeurMSS');
const { decodeTokenDuCookie, enObjet } = require('../../aides/cookie');

describe('Le serveur MSS des routes connectées /oidc/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => {
    testeur.initialise();
  });

  afterEach(testeur.arrete);
  describe('quand requête GET sur /oidc/deconnexion', () => {
    let idTokenAgentConnect;
    beforeEach(() => {
      testeur
        .middleware()
        .reinitialise({ idTokenAgentConnectAUtiliser: 'idTokenAgentConnect' });
      testeur.adaptateurOidc().genereDemandeDeconnexion = async (idToken) => {
        idTokenAgentConnect = idToken;
        return {
          state: 'unState',
          url: 'http',
        };
      };
    });

    it('redirige vers la page de déconnexion', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/deconnexion'
      );

      expect(reponse.status).to.be(302);
      expect(reponse.headers.location).to.be('http');
      expect(idTokenAgentConnect).to.be('idTokenAgentConnect');
    });

    it('dépose un cookie avec le state', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/deconnexion'
      );

      const headerCookie = reponse.headers['set-cookie'];
      const cookie = enObjet(headerCookie[0]).AgentConnectInfo;

      expect(cookie).to.contain('unState');
    });
  });
});
