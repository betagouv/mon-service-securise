const expect = require('expect.js');
const Middleware = require('../src/middleware');

describe('Le middleware MSS', () => {
  it("redirige l'utilisateur vers la mire de login quand échec vérification JWT", (done) => {
    const adaptateurJWT = {
      decode: (token) => {
        expect(token).to.equal('XXX');
      },
    };

    const middleware = Middleware(adaptateurJWT);

    const requete = { session: { token: 'XXX' } };

    const reponse = {
      redirect: (url) => {
        expect(url).to.equal('/connexion');
        done();
      },
    };

    middleware.verificationJWT(requete, reponse);
  });
});
