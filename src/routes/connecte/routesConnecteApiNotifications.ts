const express = require('express');
const CentreNotifications = require('../../notifications/centreNotifications');
const {
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} = require('../../erreurs');

const routesConnecteApiNotifications = ({
  adaptateurHorloge,
  depotDonnees,
  referentiel,
}) => {
  const routes = express.Router();

  routes.get('/', async (requete, reponse) => {
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
      adaptateurHorloge,
    });
    reponse.json({
      notifications: await centreNotifications.toutesNotifications(
        requete.idUtilisateurCourant
      ),
    });
  });

  routes.put('/nouveautes/:id', async (requete, reponse, suite) => {
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
      adaptateurHorloge,
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

  routes.put('/taches/:id', async (requete, reponse, suite) => {
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
      adaptateurHorloge,
    });
    try {
      await centreNotifications.marqueTacheDeServiceLue(
        requete.idUtilisateurCourant,
        requete.params.id
      );
      reponse.sendStatus(200);
    } catch (e) {
      if (e instanceof ErreurIdentifiantTacheInconnu) {
        reponse.status(400).send('Identifiant de tâche inconnu');
        return;
      }
      suite(e);
    }
  });

  return routes;
};

module.exports = routesConnecteApiNotifications;
