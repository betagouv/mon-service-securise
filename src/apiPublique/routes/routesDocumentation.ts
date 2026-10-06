import express, { Request, Response } from 'express';
import { documentOpenApi } from '../schemas/openApi.schema.js';
import { pageDocumentation } from '../documentation/pageDocumentation.js';
import { politiqueSecuriteDocumentation } from '../middlewares/politiqueSecuriteDocumentation.js';

type ConfigurationDocumentation = { urlBaseMss: string; urlBaseApi: string };

export const routesDocumentation = ({
  urlBaseMss,
  urlBaseApi,
}: ConfigurationDocumentation) => {
  const routes = express.Router();
  const document = documentOpenApi({ urlBaseApi });
  const page = pageDocumentation(document, { urlBaseMss });

  routes.get('/openapi.json', (_requete: Request, reponse: Response) => {
    reponse.json(document);
  });

  routes.get(
    '/docs',
    politiqueSecuriteDocumentation(urlBaseMss),
    (_requete: Request, reponse: Response) => {
      reponse.type('html').send(page);
    }
  );

  return routes;
};
