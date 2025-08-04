const express = require('express');

const routesConnecteApiTeleversementModelesMesure = ({
  middleware,
  lecteurDeFormData,
}) => {
  const routes = express.Router();
  routes.post('/', middleware.protegeTrafic(), async (requete, reponse) => {
    await lecteurDeFormData.extraisDonneesXLS(requete);

    reponse.sendStatus(201);
  });

  return routes;
};

module.exports = routesConnecteApiTeleversementModelesMesure;
