const express = require('express');
const routesConnecteApiTeleversementServices = require('./routesConnecteApiTeleversement.services');
const routesConnecteApiTeleversementModelesMesure = require('./routesConnecteApiTeleversement.modelesMesureSpecifique');

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

module.exports = routesConnecteApiTeleversement;
