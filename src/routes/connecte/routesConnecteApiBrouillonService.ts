import express, { Request, Response } from 'express';
import { fabriqueAdaptateurUUID } from '../../adaptateurs/adaptateurUUID.js';

const routesConnecteApiBrouillonService = () => {
  const routes = express.Router();

  routes.post('/', async (_: Request, reponse: Response) =>
    reponse.send({ id: fabriqueAdaptateurUUID().genereUUID() })
  );

  return routes;
};

export default routesConnecteApiBrouillonService;
