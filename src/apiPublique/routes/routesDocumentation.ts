import express, { Request, Response } from 'express';
import { documentOpenApi } from '../schemas/openApi.schema.js';

const URL_REDOC =
  'https://cdn.jsdelivr.net/npm/redoc@2.5.4/bundles/redoc.standalone.js';
const INTEGRITE_REDOC =
  'sha384-w447zOpYfw/1Tv/5AK9NfHTlQIqE3RVR6KY62jCyy9zNDgO64cMwGGP1Fj0zJVf5';

const POLITIQUE_SECURITE_CONTENU = [
  "default-src 'none'",
  `script-src ${URL_REDOC}`,
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  'worker-src blob:',
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

const PAGE_REDOC = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API publique MonServiceSécurisé</title>
  </head>
  <body>
    <redoc spec-url="/openapi.json"></redoc>
    <script src="${URL_REDOC}" integrity="${INTEGRITE_REDOC}" crossorigin="anonymous"></script>
  </body>
</html>
`;

export const routesDocumentation = () => {
  const routes = express.Router();
  const document = documentOpenApi();

  routes.get('/openapi.json', (_requete: Request, reponse: Response) => {
    reponse.json(document);
  });

  routes.get('/docs', (_requete: Request, reponse: Response) => {
    reponse
      .set('Content-Security-Policy', POLITIQUE_SECURITE_CONTENU)
      .type('html')
      .send(PAGE_REDOC);
  });

  return routes;
};
