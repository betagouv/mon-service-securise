import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { schemaReponseServices } from './services.schema.js';
import { schemaReponseIndiceCyber } from './indiceCyber.schema.js';
import { schemaErreur } from './erreur.schema.js';

const reponseJson = (description: string, schema: typeof schemaErreur) => ({
  description,
  content: { 'application/json': { schema } },
});

const reponsesErreurCommunes = {
  401: reponseJson("Clé d'API absente, inconnue ou révoquée.", schemaErreur),
  429: reponseJson(
    "Quota dépassé pour cette clé d'API. Le délai d'attente est indiqué dans l'en-tête `Retry-After`.",
    schemaErreur
  ),
  500: reponseJson('Incident de notre côté.', schemaErreur),
};

const reponsesErreurDUnService = {
  400: reponseJson(
    "L'identifiant du service n'est pas un UUID valide.",
    schemaErreur
  ),
  403: reponseJson(
    "La clé d'API donne accès au service, mais pas à cette rubrique.",
    schemaErreur
  ),
  404: reponseJson(
    "Service inexistant, ou hors du périmètre de la clé d'API.",
    schemaErreur
  ),
};

const parametresDUnService = z.object({
  id: z.uuid().meta({
    description: 'Identifiant du service, obtenu via `GET /v1/services`.',
  }),
});

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

  registry.registerPath({
    method: 'get',
    path: '/v1/services/{id}/indice-cyber',
    summary: "Indice cyber d'un service",
    description:
      "L'indice cyber du service et son détail par catégorie de mesures, calculés au moment de l'appel. Nécessite le droit de lecture sur la rubrique « Sécuriser ».",
    tags: ['Services'],
    request: { params: parametresDUnService },
    responses: {
      200: {
        description: "L'indice cyber du service.",
        content: { 'application/json': { schema: schemaReponseIndiceCyber } },
      },
      ...reponsesErreurCommunes,
      ...reponsesErreurDUnService,
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
