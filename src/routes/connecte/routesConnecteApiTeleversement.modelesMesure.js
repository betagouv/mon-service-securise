const express = require('express');

const routesConnecteApiTeleversementModelesMesure = ({
  middleware,
  adaptateurControleFichier,
}) => {
  const routes = express.Router();
  routes.post('/', middleware.protegeTrafic(), async (requete, reponse) => {
    await adaptateurControleFichier.extraisDonneesXLS(requete);

    reponse.sendStatus(201);
  });

  return routes;
};

module.exports = routesConnecteApiTeleversementModelesMesure;
