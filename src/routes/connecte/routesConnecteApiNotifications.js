const express = require('express');
const CentreNotifications = require('../../notifications/centreNotifications');
const { ErreurIdentifiantNouveauteInconnu } = require('../../erreurs');

const routesConnecteApiNotifications = ({ depotDonnees, referentiel }) => {
  const routes = express.Router();

  routes.get('/', async (_requete, reponse) => {
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
    });
    reponse.json({ notifications: centreNotifications.toutesNotifications() });
  });

  routes.post('/nouveautes/:id', async (requete, reponse) => {
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
    });
    try {
      await centreNotifications.marqueNouveauteLue(
        requete.idUtilisateurCourant,
        requete.params.id
      );
      reponse.sendStatus(200);
    } catch (e) {
      if (e instanceof ErreurIdentifiantNouveauteInconnu) {
        reponse.status(400).send('Identifiant de nouveauté inconnu');
        return;
      }
      suite(e);
    }
  });

  return routes;
};

module.exports = routesConnecteApiNotifications;
