const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { enObjet, decodeTokenDuCookie } = require('../../aides/cookie');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const { requeteSansRedirection } = require('../../aides/http');

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

    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/oidc/connexion',
          done
        );
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

    it("ajoute l'url de redirection au cookie si elle est présente dans la query", async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/connexion?urlRedirection=%2FtableauDeBord'
      );

      const headerCookie = reponse.headers['set-cookie'];
      const cookie = enObjet(headerCookie[0]).AgentConnectInfo;

      expect(cookie).to.contain('tableauDeBord');
    });

    it("n'ajoute pas l'url de redirection au cookie si elle est présente dans la query mais illégale (dangereuse)", async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/connexion?urlRedirection=https%3A%2F%2Funautresite.com'
      );

      const headerCookie = reponse.headers['set-cookie'];
      const cookie = enObjet(headerCookie[0]).AgentConnectInfo;

      expect(cookie).not.to.contain('unautresite');
    });
  });

  describe('quand requête GET sur `/oidc/apres-authentification`', () => {
    beforeEach(() => {
      const utilisateur = unUtilisateur().quiAccepteCGU().construis();
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
      testeur.depotDonnees().metsAJourUtilisateur = () => {};
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) =>
          (requete.cookies.AgentConnectInfo = {
            state: 'unState',
            nonce: 'unNonce',
          }),
      });
    });

    it('sert une page HTML', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
    });

    it('considère une url de redirection comme relative pour se protéger des open redirect', async () => {
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) =>
          (requete.cookies.AgentConnectInfo = {
            state: 'unState',
            nonce: 'unNonce',
            urlRedirection: '//redirect.com',
          }),
      });

      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );

      expect(reponse.data).to.contain('http://localhost:1234//redirect.com');
    });

    it("ne fait aucune redirection en cas d'absence d'URL de redirection", async () => {
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) =>
          (requete.cookies.AgentConnectInfo = {
            state: 'unState',
            nonce: 'unNonce',
          }),
      });

      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-authentification'
      );

      expect(reponse.data).not.to.contain('http://localhost:1234');
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

    describe("si l'utilisateur est inconnu", () => {
      it('affiche la page d’inscription via un jeton signé en paramètre', async () => {
        let donneesRecues;
        testeur.adaptateurOidc().recupereJeton = async () => ({
          accessToken: 'unAccessToken',
        });
        testeur.adaptateurOidc().recupereInformationsUtilisateur = async (
          accessToken
        ) => {
          if (accessToken === 'unAccessToken')
            return {
              email: 'unEmailInconnu',
              nom: 'Dujardin',
              prenom: 'Jean',
              siret: '12345',
            };
          throw new Error(
            'La méthode doit être appellée avec un `accessToken`'
          );
        };
        testeur.adaptateurJWT().signeDonnees = (donnees) => {
          donneesRecues = donnees;
          return 'unJetonSigne';
        };

        const reponse = await requeteSansRedirection(
          'http://localhost:1234/oidc/apres-authentification'
        );

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be(
          '/creation-compte?token=unJetonSigne'
        );
        expect(donneesRecues).to.eql({
          email: 'unEmailInconnu',
          nom: 'Dujardin',
          prenom: 'Jean',
          siret: '12345',
        });
      });
    });

    describe("si l'utilisateur existe", () => {
      it("connecte l'utilisateur", async () => {
        const utilisateurAuthentifie = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiAccepteCGU()
          .construis();
        utilisateurAuthentifie.genereToken = (source) => `unJetonJWT-${source}`;
        testeur.depotDonnees().utilisateurAvecEmail = (email) =>
          email === 'jean.dujardin@beta.gouv.fr'
            ? utilisateurAuthentifie
            : undefined;

        const reponse = await requeteSansRedirection(
          'http://localhost:1234/oidc/apres-authentification'
        );

        const tokenDecode = decodeTokenDuCookie(reponse, 1);
        expect(tokenDecode.token).to.be('unJetonJWT-AGENT_CONNECT');
      });

      it("délègue au dépôt de données l'enregistrement de la dernière connexion utilisateur'", async () => {
        let idUtilisateurPasse = {};
        let sourcePassee;
        testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur = async (
          idUtilisateur,
          source
        ) => {
          idUtilisateurPasse = idUtilisateur;
          sourcePassee = source;
        };

        const utilisateurAuthentifie = unUtilisateur()
          .avecId('456')
          .quiAccepteCGU()
          .construis();
        utilisateurAuthentifie.genereToken = () => 'unJetonJWT';
        testeur.depotDonnees().utilisateurAvecEmail = async () =>
          utilisateurAuthentifie;

        await requeteSansRedirection(
          'http://localhost:1234/oidc/apres-authentification'
        );

        expect(idUtilisateurPasse).to.be('456');
        expect(sourcePassee).to.be('AGENT_CONNECT');
      });

      it("enrichis le profil de l'utilisateur s'il n'est pas complet avec les informations AgentConnect", async () => {
        let donneesRecues;
        testeur.depotDonnees().metsAJourUtilisateur = async (
          idUtilisateur,
          donnees
        ) => {
          donneesRecues = { idUtilisateur, donnees };
        };
        testeur.adaptateurOidc().recupereInformationsUtilisateur =
          async () => ({
            email: 'jean.dujardin@beta.gouv.fr',
            nom: 'Dujardin',
            prenom: 'Jean',
            siret: '12345',
          });

        const utilisateurAuthentifie = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiSAppelle('')
          .avecId('456')
          .quiAccepteCGU()
          .construis();
        utilisateurAuthentifie.genereToken = () => 'unJetonJWT';
        testeur.depotDonnees().utilisateurAvecEmail = async () =>
          utilisateurAuthentifie;

        await requeteSansRedirection(
          'http://localhost:1234/oidc/apres-authentification'
        );

        expect(donneesRecues.idUtilisateur).to.be('456');
        expect(donneesRecues.donnees.prenom).to.be('Jean');
        expect(donneesRecues.donnees.nom).to.be('Dujardin');
        expect(donneesRecues.donnees.entite.siret).to.be('12345');
      });
    });

    describe("si l'utilisateur existe et qu'il a été invité", () => {
      it("ne connecte pas l'utilisateur", async () => {
        const invite = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiAEteInvite()
          .construis();
        invite.genereToken = () => 'unJetonQuiNeDevraitPasEtreDepose';
        testeur.depotDonnees().utilisateurAvecEmail = (email) =>
          email === 'jean.dujardin@beta.gouv.fr' ? invite : undefined;

        const reponse = await requeteSansRedirection(
          'http://localhost:1234/oidc/apres-authentification'
        );

        const tokenDecode = decodeTokenDuCookie(reponse, 1);
        expect(tokenDecode).to.be(undefined);
      });
    });
  });

  describe('quand requête GET sur `/oidc/apres-deconnexion`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) => {
          requete.cookies.AgentConnectInfo = { state: 'unState' };
        },
      });
    });
    it('redirige vers la page de connexion', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-deconnexion?state=unState'
      );

      expect(reponse.status).to.be(302);
      expect(reponse.headers.location).to.be('/connexion');
    });

    it("supprime la session de l'utilisateur via la page /connexion", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/oidc/apres-deconnexion?state=unState',
          done
        );
    });

    it("ne déconnecte pas l'utilisateur si le state ne correspond pas", async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-deconnexion?state=pasLeBonState'
      );

      expect(reponse.status).to.be(401);
    });

    it('supprime le cookie contenant le state', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/oidc/apres-deconnexion?state=unState'
      );

      const cookies = reponse.headers['set-cookie'];
      expect(cookies).not.to.be(undefined);
      expect(enObjet(cookies[0]).AgentConnectInfo).to.be('');
    });
  });
});
