import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { schemaReponseServices } from './schemas/services.schema.js';
import { schemaErreur } from './schemas/erreur.schema.js';

const reponseJson = (description: string, schema: typeof schemaErreur) => ({
  description,
  content: { 'application/json': { schema } },
});

const reponsesErreurCommunes = {
  401: reponseJson("Clé d'API absente, inconnue ou révoquée.", schemaErreur),
  500: reponseJson('Incident de notre côté.', schemaErreur),
};

const enregistreLesRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'get',
    path: '/v1/services',
    summary: 'Liste des services',
    description:
      "Les services numériques auxquels la clé d'API donne accès. Fournit les `id` utilisés par les autres routes.",
    tags: ['Services'],
    responses: {
      200: {
        description: 'Les services accessibles.',
        content: { 'application/json': { schema: schemaReponseServices } },
      },
      ...reponsesErreurCommunes,
    },
  });
};

export const documentOpenApi = () => {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'cleApi', {
    type: 'http',
    scheme: 'bearer',
    description:
      "Clé d'API personnelle, à demander depuis votre compte MonServiceSécurisé. À transmettre dans l'en-tête `Authorization: Bearer mss_live_…`.",
  });
  enregistreLesRoutes(registry);

  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'API publique MonServiceSécurisé',
      version: '1.0.0',
      description:
        'API en lecture seule donnant accès, dans vos propres outils, aux données des services que vous voyez déjà dans MonServiceSécurisé.',
    },
    security: [{ cleApi: [] }],
  });
};
