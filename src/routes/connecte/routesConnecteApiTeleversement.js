const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

const routesConnecteApiTeleversement = ({
  adaptateurControleFichier,
  adaptateurXLS,
}) => {
  const routes = express.Router();
  routes.post('/services', async (requete, reponse) => {
    try {
      const buffer = await adaptateurControleFichier.verifieFichierXls(requete);
      await adaptateurXLS.extraisTeleversementServices(buffer);
    } catch (e) {
      if (e instanceof ErreurFichierXlsInvalide) {
        reponse.sendStatus(400);
        return;
      }
      throw e;
    }
    reponse.sendStatus(201);
  });
  return routes;
};

module.exports = routesConnecteApiTeleversement;
