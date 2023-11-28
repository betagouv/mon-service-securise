const axios = require('axios');
const express = require('express');
const adaptateurEnvironnement = require('../../adaptateurs/adaptateurEnvironnement');

const CHEMINS_BIBLIOTHEQUES = {
  get: {
    'matomo-tag-manager.js': adaptateurEnvironnement.matomo().urlTagManager(),
    'piwik.js': 'https://stats.data.gouv.fr/piwik.js',
  },
  post: {
    evenementMatomo: 'https://stats.data.gouv.fr/piwik.php',
  },
};

const CSP_BIBLIOTHEQUES = {
  matomo: { connect: 'https://stats.data.gouv.fr/piwik.php' },
};

const routesBibliotheques = () => {
  const routes = express.Router();

  const ajouteRoutes = (methode) =>
    routes[methode]('/:nomBibliotheque', async (requete, reponse, suite) => {
      const { nomBibliotheque } = requete.params;
      const chemin = CHEMINS_BIBLIOTHEQUES[methode][nomBibliotheque];

      if (!chemin) {
        reponse.status(404).send(`Bibliothèque inconnue : ${nomBibliotheque}`);
        return;
      }

      try {
        const reponseServeur = await axios[methode](
          chemin,
          {},
          { params: requete.query }
        );
        reponse
          .status(reponseServeur.status)
          .type('text/javascript')
          .send(reponseServeur.data);
      } catch (e) {
        suite();
      }
    });

  Object.keys(CHEMINS_BIBLIOTHEQUES).forEach(ajouteRoutes);

  return routes;
};

module.exports = { routesBibliotheques, CSP_BIBLIOTHEQUES };
