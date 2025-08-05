const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

const routesConnecteApiTeleversementModelesMesureSpecifique = ({
  middleware,
  lecteurDeFormData,
}) => {
  const routes = express.Router();
  routes.post('/', middleware.protegeTrafic(), async (requete, reponse) => {
    try {
      await lecteurDeFormData.extraisDonneesXLS(requete);
      reponse.sendStatus(201);
    } catch (e) {
      if (e instanceof ErreurFichierXlsInvalide) {
        reponse.sendStatus(400);
        return;
      }

      throw e;
    }
  });

  return routes;
};

module.exports = routesConnecteApiTeleversementModelesMesureSpecifique;
