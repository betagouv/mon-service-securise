import express, { Request, Response } from 'express';
import path from 'node:path';
import { documentOpenApi } from '../schemas/openApi.schema.js';
import {
  pageDocumentation,
  SCRIPT_UI_KIT,
  SOURCES_EXTERNES,
} from '../documentation/pageDocumentation.js';

const POLITIQUE_SECURITE_CONTENU = [
  "default-src 'none'",
  `script-src ${SCRIPT_UI_KIT}`,
  `style-src 'self' 'unsafe-inline' ${SOURCES_EXTERNES.uiKit}`,
  "font-src 'self'",
  `img-src 'self' data: ${SOURCES_EXTERNES.uiKitAssets}`,
  `connect-src ${SOURCES_EXTERNES.uiKitAssets}`,
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

const DOSSIER_ASSETS = path.resolve('public/assets');

export const routesDocumentation = () => {
  const routes = express.Router();
  const document = documentOpenApi();
  const page = pageDocumentation(document);

  routes.get('/openapi.json', (_requete: Request, reponse: Response) => {
    reponse.json(document);
  });

  routes.get('/docs', (_requete: Request, reponse: Response) => {
    reponse
      .set('Content-Security-Policy', POLITIQUE_SECURITE_CONTENU)
      .type('html')
      .send(page);
  });

  routes.get(
    '/statique/assets/styles/fonts.css',
    (_requete: Request, reponse: Response) => {
      reponse.sendFile(path.join(DOSSIER_ASSETS, 'styles/fonts.css'));
    }
  );

  routes.use(
    '/statique/assets/fonts',
    express.static(path.join(DOSSIER_ASSETS, 'fonts'))
  );

  return routes;
};
