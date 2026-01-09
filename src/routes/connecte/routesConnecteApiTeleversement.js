import express from 'express';
import routesConnecteApiTeleversementModelesMesure from './routesConnecteApiTeleversement.modelesMesureSpecifique.js';
import { routesConnecteApiTeleversementServicesV2 } from './routesConnecteApiTeleversement.servicesV2.js';

const routesConnecteApiTeleversement = ({
  lecteurDeFormData,
  adaptateurTeleversementServices,
  adaptateurTeleversementModelesMesureSpecifique,
  busEvenements,
  depotDonnees,
  middleware,
}) => {
  const routes = express.Router();

  routes.use(
    '/services-v2',
    routesConnecteApiTeleversementServicesV2({
      lecteurDeFormData,
      adaptateurTeleversementServices,
      busEvenements,
      depotDonnees,
      middleware,
    })
  );

  routes.use(
    '/modelesMesureSpecifique',
    routesConnecteApiTeleversementModelesMesure({
      lecteurDeFormData,
      middleware,
      adaptateurTeleversementModelesMesureSpecifique,
      depotDonnees,
    })
  );

  return routes;
};

export default routesConnecteApiTeleversement;
