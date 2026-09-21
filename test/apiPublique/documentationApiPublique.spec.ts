import request from 'supertest';
import { creeServeurApiPublique } from '../../src/apiPublique/mssApiPublique.js';
import { depotVide } from '../depots/depotVide.js';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { AdaptateurGestionErreur } from '../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

describe("La documentation de l'API publique", () => {
  let depotDonnees: DepotDonnees;

  beforeEach(async () => {
    depotDonnees = await depotVide();
  });

  const uneApp = () =>
    creeServeurApiPublique({
      depotDonnees,
      adaptateurGestionErreur: {
        logueErreur: () => {},
      } as unknown as AdaptateurGestionErreur,
    }).app;

  describe('sur GET /openapi.json', () => {
    const leDocumentOpenApi = async () => {
      const reponse = await request(uneApp()).get('/openapi.json');
      return reponse.body;
    };

    it("est accessible sans clé d'API", async () => {
      const reponse = await request(uneApp()).get('/openapi.json');

      expect(reponse.status).toBe(200);
      expect(reponse.body.openapi).toBe('3.1.0');
    });

    it("déclare l'authentification par clé d'API en `Bearer`", async () => {
      const document = await leDocumentOpenApi();

      expect(document.components.securitySchemes.cleApi).toMatchObject({
        type: 'http',
        scheme: 'bearer',
      });
      expect(document.security).toEqual([{ cleApi: [] }]);
    });

    it('documente GET /v1/services et ses réponses', async () => {
      const document = await leDocumentOpenApi();

      const reponses = document.paths['/v1/services'].get.responses;
      expect(Object.keys(reponses)).toEqual(['200', '401', '500']);
      expect(reponses['200'].content['application/json'].schema).toEqual({
        $ref: '#/components/schemas/ReponseServices',
      });
    });

    it('décrit les champs d’un service à partir du schéma de sortie', async () => {
      const document = await leDocumentOpenApi();

      const schemaService = document.components.schemas.Service;
      expect(Object.keys(schemaService.properties)).toEqual([
        'id',
        'nom',
        'organisationResponsable',
        'nombreContributeurs',
        'niveauSecurite',
      ]);
      expect(schemaService.required).not.toContain('niveauSecurite');
    });
  });

  describe('sur GET /docs', () => {
    it("sert la page Redoc, sans clé d'API, branchée sur le document OpenAPI", async () => {
      const reponse = await request(uneApp()).get('/docs');

      expect(reponse.status).toBe(200);
      expect(reponse.headers['content-type']).toContain('text/html');
      expect(reponse.text).toContain('<redoc spec-url="/openapi.json">');
    });

    it("charge Redoc dans une version figée, avec contrôle d'intégrité", async () => {
      const reponse = await request(uneApp()).get('/docs');

      expect(reponse.text).toContain(
        'src="https://cdn.jsdelivr.net/npm/redoc@2.5.4/bundles/redoc.standalone.js"'
      );
      expect(reponse.text).toContain(
        'integrity="sha384-w447zOpYfw/1Tv/5AK9NfHTlQIqE3RVR6KY62jCyy9zNDgO64cMwGGP1Fj0zJVf5"'
      );
    });

    it('restreint la page avec une politique de sécurité du contenu', async () => {
      const reponse = await request(uneApp()).get('/docs');

      const csp = reponse.headers['content-security-policy'];
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain(
        'script-src https://cdn.jsdelivr.net/npm/redoc@2.5.4/bundles/redoc.standalone.js'
      );
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain('worker-src blob:');
    });
  });
});
