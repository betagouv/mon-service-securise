const express = require('express');
const routesConnecteApiTeleversementServices = require('./routesConnecteApiTeleversement.services');
const routesConnecteApiTeleversementModelesMesure = require('./routesConnecteApiTeleversement.modelesMesure');

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

  routes.use(
    '/modeles-de-mesure',
    routesConnecteApiTeleversementModelesMesure({
      adaptateurControleFichier,
      middleware,
    })
  );

  return routes;
};

module.exports = routesConnecteApiTeleversement;
