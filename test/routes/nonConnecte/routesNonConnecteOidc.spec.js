import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import {
  enObjet,
  decodeSessionDuCookie,
  expectContenuSessionValide,
} from '../../aides/cookie.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { donneesPartagees } from '../../aides/http.js';

describe('Le serveur MSS des routes publiques /oidc/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête GET sur `/oidc/connexion`', () => {
    beforeEach(() => {
      testeur.adaptateurOidc().genereDemandeAutorisation = async () => ({
        nonce: 'unNonce',
        state: 'unState',
        url: 'http',
      });
    });

    it("déconnecte l'utilisateur courant", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(testeur.app(), '/oidc/connexion');
    });

    it("répond 400 si l'url de redirection est trop longue", async () => {
      const tropLong = new Array(1001).fill('a').join('');

      const reponse = await testeur.get(
        `/oidc/connexion?urlRedirection=${tropLong}`
      );

      expect(reponse.status).to.be(400);
    });

    it('redirige vers la page d’autorisation', async () => {
      const reponse = await testeur.get('/oidc/connexion');

      expect(reponse.status).to.be(302);
      expect(reponse.headers.location).to.be('http');
    });

    it('dépose un cookie avec le nonce et le state', async () => {
      const reponse = await testeur.get('/oidc/connexion');

      const headerCookie = reponse.headers['set-cookie'];
      const cookie = enObjet(headerCookie[0]).AgentConnectInfo;

      expect(cookie).to.contain('unState');
      expect(cookie).to.contain('unNonce');
    });

    it("ajoute l'url de redirection au cookie si elle est présente dans la query", async () => {
      const reponse = await testeur.get(
        '/oidc/connexion?urlRedirection=%2FtableauDeBord'
      );

      const headerCookie = reponse.headers['set-cookie'];
      const cookie = enObjet(headerCookie[0]).AgentConnectInfo;

      expect(cookie).to.contain('tableauDeBord');
    });

    it("n'ajoute pas l'url de redirection au cookie si elle est présente dans la query mais illégale (dangereuse)", async () => {
      const reponse = await testeur.get(
        '/oidc/connexion?urlRedirection=https%3A%2F%2Funautresite.com'
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
      testeur.depotDonnees().utilisateur = () => utilisateur;
      testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur = () => {};
      testeur.depotDonnees().metsAJourUtilisateur = () => {};
      testeur.depotDonnees().rafraichisProfilUtilisateurLocal = () => {};
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) =>
          (requete.cookies.AgentConnectInfo = {
            state: 'unState',
            nonce: 'unNonce',
          }),
      });
      testeur.serviceAnnuaire().rechercheOrganisations = () => [];
      testeur.adaptateurProfilAnssi().recupere = () => undefined;
    });

    it('sert une page HTML', async () => {
      const reponse = await testeur.get('/oidc/apres-authentification');

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

      const reponse = await testeur.get('/oidc/apres-authentification');

      expect(reponse.text).to.contain('//redirect.com');
    });

    it("ne fait aucune redirection en cas d'absence d'URL de redirection", async () => {
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) =>
          (requete.cookies.AgentConnectInfo = {
            state: 'unState',
            nonce: 'unNonce',
          }),
      });

      const reponse = await testeur.get('/oidc/apres-authentification');

      expect(reponse.body).not.to.contain('');
    });

    it("reste robuste en cas d'erreur de récupération du jeton", async () => {
      testeur.adaptateurOidc().recupereJeton = async () => {
        throw new Error();
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        401,
        "Erreur d'authentification",
        '/oidc/apres-authentification'
      );
    });

    it("enrichit la session avec l'`id_token`", async () => {
      testeur.adaptateurOidc().recupereJeton = async () => ({
        idToken: 'unIdToken',
      });
      const reponse = await testeur.get('/oidc/apres-authentification');
      const tokenDecode = decodeSessionDuCookie(reponse, 1);
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

        const reponse = await testeur.get('/oidc/apres-authentification');

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be(
          '/creation-compte?token=unJetonSigne'
        );
        expect(donneesRecues).to.eql({
          email: 'unEmailInconnu',
          nom: 'Dujardin',
          prenom: 'Jean',
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

        const reponse = await testeur.get('/oidc/apres-authentification');

        const tokenDecode = decodeSessionDuCookie(reponse, 1);
        expect(tokenDecode.token).to.be('unJetonJWT-AGENT_CONNECT');
      });

      it('ajoute une session utilisateur', async () => {
        const utilisateurAuthentifie = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiAccepteCGU()
          .construis();
        utilisateurAuthentifie.genereToken = (source) =>
          `un token de source ${source}`;
        testeur.depotDonnees().utilisateurAvecEmail = (email) =>
          email === 'jean.dujardin@beta.gouv.fr'
            ? utilisateurAuthentifie
            : undefined;

        const reponse = await testeur.get('/oidc/apres-authentification');

        expectContenuSessionValide(reponse, 'AGENT_CONNECT', true, false, 1);
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

        await testeur.get('/oidc/apres-authentification');

        expect(idUtilisateurPasse).to.be('456');
        expect(sourcePassee).to.be('AGENT_CONNECT');
      });

      it("enrichis le profil de l'utilisateur avec les informations ProConnect dans le cas d'un profil incomplet", async () => {
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

        const profilIncomplet = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiSAppelle('')
          .avecId('456')
          .quiAccepteCGU()
          .construis();
        profilIncomplet.genereToken = () => 'unJetonJWT';
        testeur.depotDonnees().utilisateurAvecEmail = async () =>
          profilIncomplet;

        await testeur.get('/oidc/apres-authentification');

        expect(donneesRecues.idUtilisateur).to.be('456');
        expect(donneesRecues.donnees.prenom).to.be('Jean');
        expect(donneesRecues.donnees.nom).to.be('Dujardin');
        expect(donneesRecues.donnees.entite.siret).to.be('12345');
      });

      it("n'enrichis pas le profil de l'utilisateur s'il est invité, pour éviter qu'une erreur de profil incomplet soit jetée par MPA", async () => {
        let depotAppele = false;
        testeur.depotDonnees().metsAJourUtilisateur = async () => {
          depotAppele = true;
        };

        const profilInvite = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiAEteInvite()
          .construis();
        profilInvite.genereToken = () => 'unJetonJWT';
        testeur.depotDonnees().utilisateurAvecEmail = async () => profilInvite;

        await testeur.get('/oidc/apres-authentification');

        expect(depotAppele).to.be(false);
      });

      it("rafraîchis la copie locale du profil Utilisateur dans le cas d'un profil complet : on veut rappatrier les données MPA chez MSS", async () => {
        let idRafraichi;
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal = async (
          idUtilisateur
        ) => {
          idRafraichi = idUtilisateur;
        };
        testeur.adaptateurOidc().recupereInformationsUtilisateur =
          async () => ({
            email: 'jean.dujardin@beta.gouv.fr',
            nom: 'Dujardin',
            prenom: 'Jean',
            siret: '12345',
          });

        const profilComplet = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiSAppelle('Jean Dujardin')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .avecId('456')
          .quiAccepteCGU()
          .construis();
        profilComplet.genereToken = () => 'unJetonJWT';
        testeur.depotDonnees().utilisateurAvecEmail = async () => profilComplet;

        await testeur.get('/oidc/apres-authentification');

        expect(idRafraichi).to.be('456');
      });
    });

    describe("si l'utilisateur existe et qu'il a été invité", () => {
      let invite;

      beforeEach(() => {
        invite = unUtilisateur()
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .quiAEteInvite()
          .construis();
        testeur.depotDonnees().utilisateurAvecEmail = (email) =>
          email === 'jean.dujardin@beta.gouv.fr' ? invite : undefined;
        invite.genereToken = () => 'unJetonJWT-AGENT_CONNECT-INVITE';
      });

      it("connecte l'utilisateur", async () => {
        const reponse = await testeur.get('/oidc/apres-authentification');

        const tokenDecode = decodeSessionDuCookie(reponse, 1);
        expect(tokenDecode.token).to.be('unJetonJWT-AGENT_CONNECT-INVITE');
      });

      it("retourne la page `apresAuthentification` avec le jeton signé de l'invité dans les données", async () => {
        testeur.adaptateurOidc().recupereJeton = async () => ({
          accessToken: 'unAccessToken',
        });
        let donneesRecuesPourCreationTokenSigne;
        testeur.adaptateurJWT().signeDonnees = (donnees) => {
          donneesRecuesPourCreationTokenSigne = donnees;
          return 'unJetonSigne';
        };
        testeur.adaptateurOidc().recupereInformationsUtilisateur =
          async () => ({
            email: 'jean.dujardin@beta.gouv.fr',
            nom: 'Dujardin',
            prenom: 'Jean',
          });
        testeur.depotDonnees().utilisateur = async () => {
          const utilisateurExistant = unUtilisateur()
            .avecEmail('jean.dujardin@beta.gouv.fr')
            .quiAEteInvite()
            .construis();
          utilisateurExistant.genereToken = () => 'un token';
          return utilisateurExistant;
        };
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
          async () => {};

        const reponse = await testeur.get('/oidc/apres-authentification');

        expect(reponse.status).to.be(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
        expect(donneesRecuesPourCreationTokenSigne).to.eql({
          email: 'jean.dujardin@beta.gouv.fr',
          nom: 'Dujardin',
          prenom: 'Jean',
          invite: true,
        });
        expect(donneesPartagees(reponse.text, 'tokenDonneesInvite')).to.eql({
          tokenDonneesInvite: 'unJetonSigne',
        });
      });

      it("utilise les informations ProConnect pour le jeton signé de l'invité s'il n'existe pas dans MPA", async () => {
        testeur.adaptateurOidc().recupereJeton = async () => ({
          accessToken: 'unAccessToken',
        });
        let donneesRecuesPourCreationTokenSigne;
        testeur.adaptateurJWT().signeDonnees = (donnees) => {
          donneesRecuesPourCreationTokenSigne = donnees;
          return 'unJetonSigne';
        };
        testeur.adaptateurOidc().recupereInformationsUtilisateur =
          async () => ({
            nom: 'Dujardin ProConnect',
            prenom: 'Jean ProConnect',
            email: 'jean.dujardin@beta.gouv.fr',
            siret: '12345',
          });
        testeur.depotDonnees().utilisateur = async () => {
          const utilisateurExistant = unUtilisateur()
            .avecEmail('jean.dujardin@beta.gouv.fr')
            .quiAEteInvite()
            .construis();
          utilisateurExistant.genereToken = () => 'un token';
          return utilisateurExistant;
        };
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
          async () => {};

        const reponse = await testeur.get('/oidc/apres-authentification');

        expect(reponse.status).to.be(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
        expect(donneesRecuesPourCreationTokenSigne).to.eql({
          email: 'jean.dujardin@beta.gouv.fr',
          nom: 'Dujardin ProConnect',
          prenom: 'Jean ProConnect',
          invite: true,
        });
        expect(donneesPartagees(reponse.text, 'tokenDonneesInvite')).to.eql({
          tokenDonneesInvite: 'unJetonSigne',
        });
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
      const reponse = await testeur.get(
        '/oidc/apres-deconnexion?state=unState'
      );

      expect(reponse.status).to.be(302);
      expect(reponse.headers.location).to.be('/connexion');
    });

    it("supprime la session de l'utilisateur via la page /connexion", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          testeur.app(),
          '/oidc/apres-deconnexion?state=unState'
        );
    });

    it('rejette une requête sans state', async () => {
      const reponse = await testeur.get('/oidc/apres-deconnexion?state=');

      expect(reponse.status).to.be(400);
    });

    it("ne déconnecte pas l'utilisateur si le state ne correspond pas", async () => {
      const reponse = await testeur.get(
        '/oidc/apres-deconnexion?state=pasLeBonState'
      );

      expect(reponse.status).to.be(401);
    });

    it("ne déconnecte pas l'utilisateur si le cookie n'est pas positionné", async () => {
      testeur.middleware().reinitialise({
        fonctionDeposeCookieAAppeler: (requete) => {
          requete.cookies.AgentConnectInfo = null;
        },
      });

      const reponse = await testeur.get(
        '/oidc/apres-deconnexion?state=unState'
      );

      expect(reponse.status).to.be(401);
    });

    it('supprime le cookie contenant le state', async () => {
      const reponse = await testeur.get(
        '/oidc/apres-deconnexion?state=unState'
      );

      const cookies = reponse.headers['set-cookie'];
      expect(cookies).not.to.be(undefined);
      expect(enObjet(cookies[0]).AgentConnectInfo).to.be('');
    });
  });
});
