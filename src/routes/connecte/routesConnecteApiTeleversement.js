const express = require('express');
const routesConnecteApiTeleversementServices = require('./routesConnecteApiTeleversement.services');

const routesConnecteApiTeleversement = ({
  adaptateurControleFichier,
  adaptateurXLS,
  busEvenements,
  depotDonnees,
  middleware,
}) => {
  const routes = express.Router();

  routes.use(
    '/services',
    routesConnecteApiTeleversementServices({
      adaptateurControleFichier,
      adaptateurXLS,
      busEvenements,
      depotDonnees,
      middleware,
    })
  );

  return routes;
};

module.exports = routesConnecteApiTeleversement;
