const expect = require('expect.js');
const Middleware = require('../src/middleware');

describe('Le middleware MSS', () => {
  const requete = {};

  beforeEach(() => (requete.session = { token: 'XXX' }));

  it("redirige l'utilisateur vers la mire de login quand échec vérification JWT", (done) => {
    const adaptateurJWT = {
      decode: (token) => {
        expect(token).to.equal('XXX');
      },
    };

    const middleware = Middleware(adaptateurJWT);

    const reponse = {
      redirect: (url) => {
        expect(url).to.equal('/connexion');
        done();
      },
    };

    middleware.verificationJWT(requete, reponse);
  });

  it('efface les cookies sur demande', (done) => {
    expect(requete.session).to.not.be(null);

    const middleware = Middleware();
    middleware.suppressionCookie(requete, undefined, () => {
      expect(requete.session).to.be(null);
      done();
    });
  });

  describe('sur authentification basique', () => {
    it('retourne une erreur HTTP 401 et demande un challenge si échec authentification', (done) => {
      const middleware = Middleware(undefined, 'admin', 'password');

      requete.headers = {};

      const reponse = {
        set: (nomHeader, valeurHeader) => {
          expect(nomHeader).to.equal('WWW-Authenticate');
          expect(valeurHeader).to.equal('Basic realm="Administration Mon Service Sécurisé"');
        },
        status: (s) => {
          expect(s).to.equal(401);
          return reponse;
        },
        send: () => done(),
      };

      middleware.authentificationBasique(requete, reponse, () => done('Exécution suite chaîne inattendue'));
    });

    it('poursuit normalement si succès authentification', (done) => {
      const middleware = Middleware(undefined, 'admin', 'password');

      requete.headers = { authorization: 'Basic YWRtaW46cGFzc3dvcmQ=' }; // admin:password
      const reponse = {};

      middleware.authentificationBasique(requete, reponse, () => {
        expect(requete.auth.user).to.equal('admin');
        expect(requete.auth.password).to.equal('password');
        done();
      });
    });
  });
});
