const express = require('express');

const routesService = (middleware) => {
  const routes = express.Router();

  routes.get('/:id/homologations', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('service/homologations', { homologation });
  });

  return routes;
};

module.exports = routesService;
