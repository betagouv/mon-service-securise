import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { schemaReponseServices } from './services.schema.js';
import { schemaReponseIndiceCyber } from './indiceCyber.schema.js';
import { schemaReponseMesures } from './mesures.schema.js';
import { schemaReponseHomologation } from './homologation.schema.js';
import { schemaReponseRisques } from './risques.schema.js';
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

type RouteDUnService = {
  chemin: string;
  resume: string;
  description: string;
  descriptionReponse: string;
  schemaReponse: z.ZodType;
};

const enregistreUneRouteDUnService = (
  registry: OpenAPIRegistry,
  {
    chemin,
    resume,
    description,
    descriptionReponse,
    schemaReponse,
  }: RouteDUnService
) => {
  registry.registerPath({
    method: 'get',
    path: chemin,
    summary: resume,
    description,
    tags: ['Services'],
    request: { params: parametresDUnService },
    responses: {
      200: {
        description: descriptionReponse,
        content: { 'application/json': { schema: schemaReponse } },
      },
      ...reponsesErreurCommunes,
      ...reponsesErreurDUnService,
    },
  });
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

  enregistreUneRouteDUnService(registry, {
    chemin: '/v1/services/{id}/indice-cyber',
    resume: "Indice cyber d'un service",
    description:
      "L'indice cyber du service et son détail par catégorie de mesures, calculés au moment de l'appel. Nécessite le droit de lecture sur la rubrique « Sécuriser ».",
    descriptionReponse: "L'indice cyber du service.",
    schemaReponse: schemaReponseIndiceCyber,
  });

  enregistreUneRouteDUnService(registry, {
    chemin: '/v1/services/{id}/mesures',
    resume: "Mesures d'un service",
    description:
      "L'état d'application de chaque mesure du service : mesures du référentiel ANSSI / CNIL applicables au service, puis mesures ajoutées par l'équipe. Nécessite le droit de lecture sur la rubrique « Sécuriser ».",
    descriptionReponse: 'Les mesures du service et leur synthèse par statut.',
    schemaReponse: schemaReponseMesures,
  });

  enregistreUneRouteDUnService(registry, {
    chemin: '/v1/services/{id}/homologation',
    resume: "Homologation d'un service",
    description:
      "La dernière homologation active du service. Un dossier en cours de saisie mais pas encore finalisé n'apparaît pas. Nécessite le droit de lecture sur la rubrique « Homologuer ».",
    descriptionReponse: 'La dernière homologation active du service.',
    schemaReponse: schemaReponseHomologation,
  });

  enregistreUneRouteDUnService(registry, {
    chemin: '/v1/services/{id}/risques',
    resume: "Risques d'un service",
    description:
      "Les risques du service : ceux du référentiel ANSSI, puis ceux ajoutés par l'équipe, avec leur gravité et leur vraisemblance. Les risques désactivés par l'équipe ne sont pas renvoyés. Nécessite le droit de lecture sur la rubrique « Risques ».",
    descriptionReponse: 'Les risques du service.',
    schemaReponse: schemaReponseRisques,
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
