const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

const routesConnecteApiTeleversementModelesMesureSpecifique = ({
  middleware,
  lecteurDeFormData,
  adaptateurTeleversementModelesMesureSpecifique,
}) => {
  const routes = express.Router();
  routes.post('/', middleware.protegeTrafic(), async (requete, reponse) => {
    try {
      const buffer = await lecteurDeFormData.extraisDonneesXLS(requete);
      await adaptateurTeleversementModelesMesureSpecifique.extraisDonneesTeleversees(
        buffer
      );

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
