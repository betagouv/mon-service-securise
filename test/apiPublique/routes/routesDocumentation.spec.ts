import request from 'supertest';
import { creeServeurApiPublique } from '../../../src/apiPublique/mssApiPublique.js';
import { depotVide } from '../../depots/depotVide.js';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { AdaptateurGestionErreur } from '../../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

describe("Les routes de documentation de l'API publique", () => {
  let depotDonnees: DepotDonnees;

  beforeEach(async () => {
    depotDonnees = await depotVide();
  });

  const uneApp = () =>
    creeServeurApiPublique({
      depotDonnees,
      urlBaseMss: 'https://mss.example.org',
      adaptateurGestionErreur: {
        logueErreur: () => {},
      } as unknown as AdaptateurGestionErreur,
      adaptateurAuditApiPublique: { trace: async () => {} },
    }).app;

  describe('sur GET /openapi.json', () => {
    it("est accessible sans clé d'API", async () => {
      const reponse = await request(uneApp()).get('/openapi.json');

      expect(reponse.status).toBe(200);
      expect(reponse.body.openapi).toBe('3.1.0');
    });
  });

  describe('sur GET /docs', () => {
    it("sert la page de documentation, sans clé d'API, rendue côté serveur depuis le document OpenAPI", async () => {
      const reponse = await request(uneApp()).get('/docs');

      expect(reponse.status).toBe(200);
      expect(reponse.headers['content-type']).toContain('text/html');
      expect(reponse.text).toContain('<dsfr-header');
      expect(reponse.text).toContain('id="operation-get-v1-services"');
      expect(reponse.text).toContain('href="/openapi.json"');
    });

    it('charge le UI Kit dans une version figée, sans dépendre du DSFR', async () => {
      const reponse = await request(uneApp()).get('/docs');

      expect(reponse.text).toContain(
        'src="https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/1.60.9/lab-anssi-ui-kit.iife.js"'
      );
      expect(reponse.text).toContain(
        'href="https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/1.60.9/dsfr-variables.css"'
      );
      expect(reponse.text).not.toContain('@gouvfr/dsfr');
    });

    it("charge les polices Marianne depuis l'application principale", async () => {
      const reponse = await request(uneApp()).get('/docs');

      expect(reponse.text).toContain(
        'href="https://mss.example.org/statique/assets/styles/fonts.css"'
      );
    });

    it("affiche le favicon et le logo ANSSI de l'application principale", async () => {
      const reponse = await request(uneApp()).get('/docs');

      expect(reponse.text).toContain(
        '<link rel="icon" href="https://mss.example.org/statique/assets/images/favicons/favicon.ico">'
      );
      expect(reponse.text).toContain(
        'brand-operator-src="https://mss.example.org/statique/assets/images/logo_ANSSI_MSS.svg"'
      );
    });

    it('restreint la page avec une politique de sécurité du contenu', async () => {
      const reponse = await request(uneApp()).get('/docs');

      const csp = reponse.headers['content-security-policy'];
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain(
        'script-src https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/1.60.9/lab-anssi-ui-kit.iife.js'
      );
      expect(csp).toContain(
        "style-src 'unsafe-inline' https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/1.60.9/ https://mss.example.org/"
      );
      expect(csp).toContain('font-src https://mss.example.org/');
      expect(csp).toContain(
        "img-src 'self' data: https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/ https://mss.example.org/"
      );
      expect(csp).not.toContain('worker-src');
    });
  });
});
