import express from 'express';
import routesConnecteApiTeleversementModelesMesure from './routesConnecteApiTeleversement.modelesMesureSpecifique.js';
import { routesConnecteApiTeleversementServicesV2 } from './routesConnecteApiTeleversement.servicesV2.js';

const routesConnecteApiTeleversement = ({
  busEvenements,
  depotDonnees,
  middleware,
  referentiel,
}) => {
  const routes = express.Router();

  routes.use(
    '/services-v2',
    routesConnecteApiTeleversementServicesV2({
      busEvenements,
      depotDonnees,
      middleware,
    })
  );

  routes.use(
    '/modelesMesureSpecifique',
    routesConnecteApiTeleversementModelesMesure({
      middleware,
      depotDonnees,
      referentiel,
    })
  );

  return routes;
};

export default routesConnecteApiTeleversement;
