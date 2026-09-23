import express, { Request, Response } from 'express';
import { documentOpenApi } from '../schemas/openApi.schema.js';
import { pageDocumentation } from '../documentation/pageDocumentation.js';
import { politiqueSecuriteDocumentation } from '../middlewares/politiqueSecuriteDocumentation.js';

export const routesDocumentation = ({ urlBaseMss }: { urlBaseMss: string }) => {
  const routes = express.Router();
  const document = documentOpenApi();
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
