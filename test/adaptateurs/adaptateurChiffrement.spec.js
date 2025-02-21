const expect = require('expect.js');
const {
  adaptateurChiffrement,
} = require('../../src/adaptateurs/adaptateurChiffrement');

describe("L'adaptateur chiffrement", () => {
  describe('sur demande de hachage SHA256', () => {
    it('ajoute v1 en préfixe de la chaîne hachée', async () => {
      const hache = adaptateurChiffrement().hacheSha256(
        '7276abd6-98bb-4bc9-bd17-d50a56aba7e4'
      );
      expect(hache).to.be(
        'v1:335ceb3ca583427ae371a2069ceb54708d93f0befbd55ac10daec0f7c7bdeee4'
      );
    });
  });
});
