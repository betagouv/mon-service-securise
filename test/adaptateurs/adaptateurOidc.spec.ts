import { AuthorizationResponseError } from 'openid-client';
import {
  estUneErreurTechniqueProConnect,
  estUneMethodeAuthentificationAvecMFA,
} from '../../src/adaptateurs/adaptateurOidc.ts';

describe("L'adaptateur OIDC", () => {
  describe('concernant la connexion avec MFA', () => {
    it("indique qu'une connexion utilise le MFA dès que `mfa` est présent", () => {
      expect(estUneMethodeAuthentificationAvecMFA(['mfa'])).toBe(true);
      expect(estUneMethodeAuthentificationAvecMFA(['pwd'])).toBe(false);
    });
  });

  describe("concernant les erreurs renvoyées par ProConnect dans la réponse d'autorisation", () => {
    const uneErreurDAutorisation = (error: string, description: string) =>
      new AuthorizationResponseError('erreur', {
        cause: new URLSearchParams({
          error,
          error_description: description,
        }),
      });

    const DESCRIPTION_ERREUR_TECHNIQUE =
      'authentication aborted due to a technical error on the authorization server';

    it('reconnaît une erreur technique de ProConnect', () => {
      const erreur = uneErreurDAutorisation(
        'invalid_request',
        DESCRIPTION_ERREUR_TECHNIQUE
      );

      expect(estUneErreurTechniqueProConnect(erreur)).toBe(true);
    });

    it('ne reconnaît pas une `invalid_request` dont la description est différente', () => {
      const erreur = uneErreurDAutorisation('invalid_request', 'invalid scope');

      expect(estUneErreurTechniqueProConnect(erreur)).toBe(false);
    });

    it('ne reconnaît pas une autre erreur que `invalid_request`', () => {
      const erreur = uneErreurDAutorisation(
        'access_denied',
        DESCRIPTION_ERREUR_TECHNIQUE
      );

      expect(estUneErreurTechniqueProConnect(erreur)).toBe(false);
    });

    it("ne reconnaît pas une erreur qui n'est pas une erreur d'autorisation", () => {
      expect(estUneErreurTechniqueProConnect(new Error())).toBe(false);
    });
  });
});
