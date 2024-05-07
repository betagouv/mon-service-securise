const express = require('express');

const routesNonConnectePage = () => {
  const routes = express.Router();

  routes.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  routes.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  return routes;
};

module.exports = routesNonConnectePage;
