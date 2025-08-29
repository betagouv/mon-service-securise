import express from 'express';
import routesConnecteApiTeleversementServices from './routesConnecteApiTeleversement.services.js';
import routesConnecteApiTeleversementModelesMesure from './routesConnecteApiTeleversement.modelesMesureSpecifique.js';

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
    '/services',
    routesConnecteApiTeleversementServices({
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
