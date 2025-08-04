const express = require('express');
const routesConnecteApiTeleversementServices = require('./routesConnecteApiTeleversement.services');
const routesConnecteApiTeleversementModelesMesure = require('./routesConnecteApiTeleversement.modelesMesure');

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
    '/modeles-de-mesure',
    routesConnecteApiTeleversementModelesMesure({
      lecteurDeFormData,
      middleware,
    })
  );

  return routes;
};

module.exports = routesConnecteApiTeleversement;
