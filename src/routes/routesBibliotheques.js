const axios = require('axios');
const express = require('express');

const CHEMINS_BIBLIOTHEQUES = {
  get: {
    'axios-1.0.0.min.js': 'https://unpkg.com/axios@1.0.0/dist/axios.min.js',
    'chart.js': 'https://cdn.jsdelivr.net/npm/chart.js@^3',
    'chartjs-plugin-datalabels.js': 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels',
    'html2canvas.min.js': 'https://unpkg.com/html2canvas/dist/html2canvas.min.js',
    'jquery-3.6.0.min.js': 'https://code.jquery.com/jquery-3.6.0.min.js',
    'jspdf.umd.min.js': 'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js',
    'piwik.js': 'https://stats.data.gouv.fr/piwik.js',
    'purify.min.js': 'https://unpkg.com/dompurify/dist/purify.min.js',
  },
  post: {
    evenementMatomo: 'https://stats.data.gouv.fr/piwik.php',
  },
};

const routesBibliotheques = () => {
  const routes = express.Router();

  const ajouteRoutes = (methode) => routes[methode]('/:nomBibliotheque', (requete, reponse, suite) => {
    const { nomBibliotheque } = requete.params;
    const chemin = CHEMINS_BIBLIOTHEQUES[methode][nomBibliotheque];

    if (chemin) {
      axios[methode](chemin, {}, { params: requete.query })
        .then((reponseServeur) => reponse.status(reponseServeur.status).type('text/javascript').send(reponseServeur.data))
        .catch(suite);
    } else {
      reponse.status(404).send(`Bibliothèque inconnue : ${nomBibliotheque}`);
    }
  });

  Object.keys(CHEMINS_BIBLIOTHEQUES).forEach(ajouteRoutes);

  return routes;
};

module.exports = routesBibliotheques;
