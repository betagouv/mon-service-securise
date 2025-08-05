const express = require('express');
const routesConnecteApiTeleversementServices = require('./routesConnecteApiTeleversement.services');
const routesConnecteApiTeleversementModelesMesure = require('./routesConnecteApiTeleversement.modelesMesureSpecifique');

const routesConnecteApiTeleversement = ({
  lecteurDeFormData,
  adaptateurXLS,
  busEvenements,
  depotDonnees,
  middleware,
}) => {
  const routes = express.Router();

  routes.use(
    '/services',
    routesConnecteApiTeleversementServices({
      lecteurDeFormData,
      adaptateurXLS,
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
    })
  );

  return routes;
};

module.exports = routesConnecteApiTeleversement;
