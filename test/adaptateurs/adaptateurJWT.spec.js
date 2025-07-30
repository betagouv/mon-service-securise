const expect = require('expect.js');
const { adaptateurJWT } = require('../../src/adaptateurs/adaptateurJWT');

describe("L'adaptateur JWT", () => {
  describe('sur demande de décodage des données', () => {
    it('retourne undefined lorsque les données à décoder ne sont pas définies', () => {
      const adaptateurEnvironnement = {
        JWT: () => ({
          secret: () => 'unsecret',
        }),
      };

      const { decode } = adaptateurJWT({
        adaptateurEnvironnement,
      });

      expect(decode(null)).to.be(undefined);
      expect(decode(undefined)).to.be(undefined);
    });

    it('décode les données signées avec le même secret', () => {
      const adaptateurEnvironnement = {
        JWT: () => ({
          secret: () => 'unsecret',
        }),
      };

      const { signeDonnees, decode } = adaptateurJWT({
        adaptateurEnvironnement,
      });

      const donnees = { toto: 42 };
      const donneesSignees = signeDonnees(donnees);
      const donneesDecodees = decode(donneesSignees);

      expect(donneesDecodees.toto).to.be(42);
    });

    it('jette une exception pour des données signées avec un autre secret', () => {
      const adaptateurEnvironnementLorsDeLaSignature = {
        JWT: () => ({
          secret: () => 'unsecret',
        }),
      };
      const adaptateurEnvironnementLorsDuDecodage = {
        JWT: () => ({
          secret: () => 'unautresecret',
        }),
      };

      const donnees = { toto: 42 };
      const donneesSignees = adaptateurJWT({
        adaptateurEnvironnement: adaptateurEnvironnementLorsDeLaSignature,
      }).signeDonnees(donnees);

      try {
        adaptateurJWT({
          adaptateurEnvironnement: adaptateurEnvironnementLorsDuDecodage,
        }).decode(donneesSignees);
        expect().fail("L'appel aurait dû jeter une erreur");
      } catch (e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.be('invalid signature');
      }
    });
  });
});
