import { adaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import { ErreurJWTManquant, ErreurJWTInvalide } from '../../src/erreurs.js';
import { AdaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement.interface.ts';

describe("L'adaptateur JWT", () => {
  describe('sur demande de décodage des données', () => {
    it('jette une erreur lorsque les données à décoder ne sont pas définies', () => {
      const adaptateurEnvironnement = {
        JWT: () => ({ secret: () => 'unsecret' }),
      } as AdaptateurEnvironnement;

      const { decode } = adaptateurJWT({ adaptateurEnvironnement });

      [null, undefined].forEach((valeurNonDefinie) => {
        // @ts-expect-error On force une valeur invalide
        expect(() => decode(valeurNonDefinie)).toThrowError(ErreurJWTManquant);
      });
    });

    it('décode les données signées avec le même secret', () => {
      const adaptateurEnvironnement = {
        JWT: () => ({ secret: () => 'unsecret' }),
      } as AdaptateurEnvironnement;

      const { signeDonnees, decode } = adaptateurJWT({
        adaptateurEnvironnement,
      });

      const donnees = { toto: 42 };
      const donneesSignees = signeDonnees(donnees);
      const donneesDecodees = decode(donneesSignees);

      expect(donneesDecodees.toto).toBe(42);
    });

    it('jette une exception pour des données signées avec un autre secret', () => {
      const adaptateurEnvironnementLorsDeLaSignature = {
        JWT: () => ({ secret: () => 'unsecret' }),
      } as AdaptateurEnvironnement;
      const adaptateurEnvironnementLorsDuDecodage = {
        JWT: () => ({ secret: () => 'unautresecret' }),
      } as AdaptateurEnvironnement;

      const donnees = { toto: 42 };
      const donneesSignees = adaptateurJWT({
        adaptateurEnvironnement: adaptateurEnvironnementLorsDeLaSignature,
      }).signeDonnees(donnees);

      expect(() =>
        adaptateurJWT({
          adaptateurEnvironnement: adaptateurEnvironnementLorsDuDecodage,
        }).decode(donneesSignees)
      ).toThrowError(ErreurJWTInvalide);
    });
  });
});
