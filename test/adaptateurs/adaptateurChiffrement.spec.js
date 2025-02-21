const expect = require('expect.js');
const {
  adaptateurChiffrement,
} = require('../../src/adaptateurs/adaptateurChiffrement');

describe("L'adaptateur chiffrement", () => {
  describe('sur demande de hachage SHA256', () => {
    it('hache avec un sel', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [{ version: 1, sel: '' }],
        }),
      };

      const hache = adaptateurChiffrement({
        adaptateurEnvironnement,
      }).hacheSha256('7276abd6-98bb-4bc9-bd17-d50a56aba7e4');

      expect(hache).to.be(
        'v1:335ceb3ca583427ae371a2069ceb54708d93f0befbd55ac10daec0f7c7bdeee4'
      );
    });

    it('hache avec deux sels', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 1, sel: '' },
            { version: 2, sel: 'abc' },
          ],
        }),
      };

      const hache = adaptateurChiffrement({
        adaptateurEnvironnement,
      }).hacheSha256('7276abd6-98bb-4bc9-bd17-d50a56aba7e4');

      expect(hache).to.be(
        'v1-v2:cb932aca72319407a746bc174d548cdacb68985c5afa2a3405110cc7696663df'
      );
    });
  });
});
