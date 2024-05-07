const express = require('express');

const routesNonConnectePage = () => {
  const routes = express.Router();

  routes.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  return routes;
};

module.exports = routesNonConnectePage;
