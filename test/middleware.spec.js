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
});
