const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { enObjet } = require('../../aides/cookie');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

const requeteSansRedirection = async (url) =>
  axios.get(url, {
    validateStatus: () => true, // pour ne pas qu’un statut 302 lance une erreur
    maxRedirects: 0,
  });

const decodeTokenDuCookie = (reponse, indiceHeader) => {
  const headerCookie = reponse.headers['set-cookie'];
  const cookieSession = enObjet(headerCookie[indiceHeader]);
  return JSON.parse(Buffer.from(cookieSession.token, 'base64').toString());
};

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
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/connexion'
      );

      expect(reponse.status).to.be(302);
      expect(reponse.headers.location).to.be('http');
    });

    it('dépose un cookie avec le nonce et le state', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/connexion'
      );

      const headerCookie = reponse.headers['set-cookie'];
      const cookie = enObjet(headerCookie[0]).AgentConnectInfo;

      expect(cookie).to.contain('unState');
      expect(cookie).to.contain('unNonce');
    });
  });

  describe('quand requête GET sur `/oidc/apres-authentification`', () => {
    beforeEach(() => {
      const utilisateur = unUtilisateur().construis();
      utilisateur.genereToken = () => 'unJetonJWT';

      testeur.adaptateurOidc().recupereJeton = async () => ({
        idToken: 'unIdToken',
      });
      testeur.adaptateurOidc().recupereInformationsUtilisateur = async () => ({
        email: 'jean.dujardin@beta.gouv.fr',
      });
      testeur.depotDonnees().utilisateurAvecEmail = (email) =>
        email === 'unEmailInconnu' ? undefined : utilisateur;
      testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur = () => {};
    });

    it('sert une page HTML', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
    });

    it("reste robuste en cas d'erreur de récupération du jeton", async () => {
      testeur.adaptateurOidc().recupereJeton = async () => {
        throw new Error();
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        401,
        "Erreur d'authentification",
        'http://localhost:1234/oidc/apres-authentification'
      );
    });

    it("enrichit la session avec l'`id_token`", async () => {
      testeur.adaptateurOidc().recupereJeton = async () => ({
        idToken: 'unIdToken',
      });
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );
      const tokenDecode = decodeTokenDuCookie(reponse, 1);
      expect(tokenDecode.AgentConnectIdToken).to.be('unIdToken');
    });

    it("renvoi une erreur 401 si l'utilisateur est inconnu", async () => {
      testeur.adaptateurOidc().recupereJeton = async () => ({
        accessToken: 'unAccessToken',
      });
      testeur.adaptateurOidc().recupereInformationsUtilisateur = async (
        accessToken
      ) => {
        if (accessToken === 'unAccessToken')
          return {
            email: 'unEmailInconnu',
          };
        throw new Error('La méthode doit être appellée avec un `accessToken`');
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        401,
        "Erreur d'authentification",
        'http://localhost:1234/oidc/apres-authentification'
      );
    });

    it("connecte l'utilisateur s'il existe", async () => {
      const utilisateurAuthentifie = unUtilisateur()
        .avecEmail('jean.dujardin@beta.gouv.fr')
        .construis();
      utilisateurAuthentifie.genereToken = () => 'unJetonJWT';
      testeur.depotDonnees().utilisateurAvecEmail = (email) =>
        email === 'jean.dujardin@beta.gouv.fr'
          ? utilisateurAuthentifie
          : undefined;

      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );

      const tokenDecode = decodeTokenDuCookie(reponse, 1);
      expect(tokenDecode.token).to.be('unJetonJWT');
    });

    it("délègue au dépôt de données l'enregistrement de la dernière connexion utilisateur'", async () => {
      let idUtilisateurPasse = {};
      testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur = async (
        idUtilisateur
      ) => {
        idUtilisateurPasse = idUtilisateur;
      };

      const utilisateurAuthentifie = unUtilisateur().avecId('456').construis();
      utilisateurAuthentifie.genereToken = () => 'unJetonJWT';
      testeur.depotDonnees().utilisateurAvecEmail = async () =>
        utilisateurAuthentifie;

      await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );

      expect(idUtilisateurPasse).to.eql('456');
    });
  });
});
