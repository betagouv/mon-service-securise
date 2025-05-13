const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

const routesConnecteApiTeleversement = ({ adaptateurControleFichier }) => {
  const routes = express.Router();
  routes.post('/services', async (requete, reponse) => {
    try {
      await adaptateurControleFichier.verifieFichierXls(requete);
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
