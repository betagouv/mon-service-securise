import type { SchemaObject } from '@asteasolutions/zod-to-openapi/dist/types.d.js';
import { documentOpenApi } from '../../../src/apiPublique/schemas/openApi.schema.js';

describe('La génération de la documentation OpenAPI', () => {
  it("déclare l'authentification par clé d'API en `Bearer`", async () => {
    const document = documentOpenApi();

    expect(document.components!.securitySchemes!.cleApi).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
    expect(document.security).toEqual([{ cleApi: [] }]);
  });

  describe('concernant le schéma de la route /v1/services', () => {
    it('décrit les champs d’un service à partir du schéma de sortie', async () => {
      const document = documentOpenApi();

      const schemaService = document.components!.schemas!
        .Service as SchemaObject;
      expect(Object.keys(schemaService.properties!)).toEqual([
        'id',
        'nom',
        'organisationResponsable',
        'nombreContributeurs',
        'besoinsSecurite',
      ]);
      expect(schemaService.required).not.toContain('besoinsSecurite');
    });

    it('documente les codes de réponse', async () => {
      const document = documentOpenApi();

      const reponses = document.paths!['/v1/services']!.get!.responses!;
      expect(Object.keys(reponses)).toEqual(['200', '401', '429', '500']);
      expect(reponses['200'].content['application/json'].schema).toEqual({
        $ref: '#/components/schemas/ReponseServices',
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const code of ['401', '429', '500']) {
        const reponse = document.paths!['/v1/services'].get!.responses![code];
        expect(reponse.content['application/json'].schema).toEqual({
          $ref: '#/components/schemas/Erreur',
        });
      }
    });
  });

  describe.each([
    {
      chemin: '/v1/services/{id}/indice-cyber',
      schemaReponse: 'ReponseIndiceCyber',
    },
    { chemin: '/v1/services/{id}/mesures', schemaReponse: 'ReponseMesures' },
    {
      chemin: '/v1/services/{id}/homologation',
      schemaReponse: 'ReponseHomologation',
    },
    { chemin: '/v1/services/{id}/risques', schemaReponse: 'ReponseRisques' },
  ])('concernant la route $chemin', ({ chemin, schemaReponse }) => {
    it("documente l'identifiant du service en paramètre de chemin", async () => {
      const document = documentOpenApi();

      const [parametre] = document.paths![chemin]!.get!.parameters! as Array<{
        name: string;
        in: string;
        required: boolean;
      }>;
      expect(parametre).toMatchObject({
        name: 'id',
        in: 'path',
        required: true,
      });
    });

    it('documente les codes de réponse', async () => {
      const document = documentOpenApi();

      const reponses = document.paths![chemin]!.get!.responses!;
      expect(Object.keys(reponses)).toEqual([
        '200',
        '400',
        '401',
        '403',
        '404',
        '429',
        '500',
      ]);
      expect(reponses['200'].content['application/json'].schema).toEqual({
        $ref: `#/components/schemas/${schemaReponse}`,
      });
    });
  });
});
