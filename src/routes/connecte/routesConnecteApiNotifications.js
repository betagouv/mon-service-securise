const express = require('express');
const CentreNotifications = require('../../notifications/centreNotifications');

const routesConnecteApiNotifications = ({ referentiel }) => {
  const routes = express.Router();

  routes.get('/', async (_requete, reponse) => {
    const centreNotifications = new CentreNotifications({ referentiel });
    reponse.json({ notifications: centreNotifications.toutesNotifications() });
  });

  return routes;
};

module.exports = routesConnecteApiNotifications;
