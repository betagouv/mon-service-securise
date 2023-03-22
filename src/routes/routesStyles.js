const axios = require('axios');
const express = require('express');

const CHEMINS_FEUILLES_DE_STYLE = {
  'selectize.default.min.css': 'https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/css/selectize.default.min.css',
};

const routesStyles = () => {
  const routes = express.Router();

  const ajouteRoutes = () => routes.get('/:nomFeuilleDeStyle', (requete, reponse, suite) => {
    const { nomFeuilleDeStyle } = requete.params;
    const chemin = CHEMINS_FEUILLES_DE_STYLE[nomFeuilleDeStyle];

    if (chemin) {
      axios.get(chemin, {}, { params: requete.query })
        .then((reponseServeur) => reponse.status(reponseServeur.status).type('text/css').send(reponseServeur.data))
        .catch(suite);
    } else {
      reponse.status(404).send('Feuille de style inconnue');
    }
  });

  Object.keys(CHEMINS_FEUILLES_DE_STYLE).forEach(ajouteRoutes);

  return routes;
};

module.exports = routesStyles;
