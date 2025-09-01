import expect from 'expect.js';
import { extraisIp } from '../../src/http/requeteHttp.js';

describe('Les fonctions sur les requêtes HTTP', () => {
  describe("concernant l'extraction des IP", () => {
    it('sait extraire l\'IP du client depuis le header "X-Forwarded-For"', () => {
      const forwardedFor = '1.1.1.1, 2.2.2.2';

      const ips = extraisIp({ 'x-forwarded-for': forwardedFor });

      expect(ips.client).to.be('1.1.1.1');
    });

    it('sait extraire l\'IP du WAF depuis le header "X-Forwarded-For"', () => {
      const forwardedFor = '1.1.1.1, 2.2.2.2';

      const ips = extraisIp({ 'x-forwarded-for': forwardedFor });

      expect(ips.waf).to.be('2.2.2.2');
    });

    it('fonctionne même quand il y a plusieurs nœuds au milieu du "X-Forwarded-For"', () => {
      const forwardedFor = '1.1.1.1, 8.8.8.8, 9.9.9.9, 2.2.2.2';

      const ips = extraisIp({ 'x-forwarded-for': forwardedFor });

      expect(ips.client).to.be('1.1.1.1');
      expect(ips.waf).to.be('2.2.2.2');
    });

    it('reste robuste si le header est introuvable (cas du dev en local par exemple)', () => {
      const sansForwardedFor = {};

      const ips = extraisIp(sansForwardedFor);

      expect(ips.client).to.be(undefined);
      expect(ips.waf).to.be(undefined);
    });
  });
});
