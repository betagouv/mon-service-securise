const express = require('express');
const CentreNotifications = require('../../notifications/centreNotifications');

const routesConnecteApiNotifications = ({ depotDonnees, referentiel }) => {
  const routes = express.Router();

  routes.get('/', async (_requete, reponse) => {
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
    });
    reponse.json({ notifications: centreNotifications.toutesNotifications() });
  });

  return routes;
};

module.exports = routesConnecteApiNotifications;
