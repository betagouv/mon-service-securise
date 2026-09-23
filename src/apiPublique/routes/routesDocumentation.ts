import express, { Request, Response } from 'express';
import { documentOpenApi } from '../schemas/openApi.schema.js';
import {
  pageDocumentation,
  SCRIPT_UI_KIT,
  SOURCES_EXTERNES,
} from '../documentation/pageDocumentation.js';

type ConfigurationDocumentation = { urlBaseMss: string };

const politiqueSecuriteContenu = (urlBaseMss: string) =>
  [
    "default-src 'none'",
    `script-src ${SCRIPT_UI_KIT}`,
    `style-src 'unsafe-inline' ${SOURCES_EXTERNES.uiKit} ${urlBaseMss}/`,
    `font-src ${urlBaseMss}/`,
    `img-src 'self' data: ${SOURCES_EXTERNES.uiKitAssets}`,
    `connect-src ${SOURCES_EXTERNES.uiKitAssets}`,
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');

export const routesDocumentation = ({
  urlBaseMss,
}: ConfigurationDocumentation) => {
  const routes = express.Router();
  const document = documentOpenApi();
  const page = pageDocumentation(document, { urlBaseMss });
  const csp = politiqueSecuriteContenu(urlBaseMss);

  routes.get('/openapi.json', (_requete: Request, reponse: Response) => {
    reponse.json(document);
  });

  routes.get('/docs', (_requete: Request, reponse: Response) => {
    reponse.set('Content-Security-Policy', csp).type('html').send(page);
  });

  return routes;
};
