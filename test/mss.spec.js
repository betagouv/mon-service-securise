const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./routes/testeurMSS');
const { unUtilisateur } = require('./constructeurs/constructeurUtilisateur');

describe('Le serveur MSS', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  it('sert des pages HTML', (done) => {
    axios
      .get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch(done);
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

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/connexion',
          done
        );
    });
  });

  describe('quand GET sur /motDePasse/edition', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      const utilisateur = unUtilisateur().avecCguAcceptees().construis();
      testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateur);

      testeur
        .middleware()
        .verifieRequeteExigeJWT(
          'http://localhost:1234/motDePasse/edition',
          done
        );
    });
  });

  describe('quand requête GET sur `/reinitialisationMotDePasse`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/reinitialisationMotDePasse',
          done
        );
    });
  });

  describe('quand requête GET sur `/initialisationMotDePasse/:idReset`', () => {
    describe('avec idReset valide', () => {
      const adaptateurJWT = {
        genereToken: () => 'un token',
      };
      const utilisateur = unUtilisateur(adaptateurJWT)
        .avecId('123')
        .construis();

      beforeEach(() => {
        testeur.depotDonnees().utilisateurAFinaliser = () =>
          Promise.resolve(utilisateur);
        testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateur);
      });

      it('dépose le jeton dans un cookie', (done) => {
        testeur.depotDonnees().utilisateurAFinaliser = (idReset) => {
          expect(idReset).to.equal('999');
          return Promise.resolve(utilisateur);
        };

        axios
          .get('http://localhost:1234/initialisationMotDePasse/999')
          .then((reponse) => testeur.verifieJetonDepose(reponse, done))
          .catch(done);
      });
    });

    it("aseptise l'identifiant reçu", (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idReset'],
          'http://localhost:1234/initialisationMotDePasse/999',
          done
        );
    });

    it('retourne une erreur HTTP 404 si idReset inconnu', (done) => {
      testeur.depotDonnees().utilisateurAFinaliser = () =>
        Promise.resolve(undefined);

      testeur.verifieRequeteGenereErreurHTTP(
        404,
        'Identifiant d\'initialisation de mot de passe "999" inconnu',
        'http://localhost:1234/initialisationMotDePasse/999',
        done
      );
    });
  });

  describe('quand requête GET sur `/admin/inscription`', () => {
    it("verrouille l'accès par une authentification basique", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAuthentificationBasique(
          'http://localhost:1234/admin/inscription',
          done
        );
    });
  });

  describe('quand requête GET sur `/espacePersonnel`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          'http://localhost:1234/espacePersonnel',
          done
        );
    });

    it('redirige vers le tableau de bord', (done) => {
      axios
        .get('http://localhost:1234/espacePersonnel')
        .then((reponse) => {
          expect(reponse.request.res.responseUrl).to.contain('tableauDeBord');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/utilisateur/edition`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      const utilisateur = unUtilisateur().avecCguAcceptees().construis();
      testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateur);
      testeur
        .middleware()
        .verifieRequeteExigeJWT(
          'http://localhost:1234/utilisateur/edition',
          done
        );
    });
  });
});
