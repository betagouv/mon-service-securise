import { estUneMethodeAuthentificationAvecMFA } from '../../src/adaptateurs/adaptateurOidc.ts';

describe("L'adaptateur OIDC", () => {
  describe('concernant la connexion avec MFA', () => {
    it("indique qu'une connexion utilise le MFA dès que `mfa` est présent", () => {
      expect(estUneMethodeAuthentificationAvecMFA(['mfa'])).toBe(true);
      expect(estUneMethodeAuthentificationAvecMFA(['pwd'])).toBe(false);
    });
  });
});
