const axios = require('axios');
const express = require('express');

const CHEMINS_BIBLIOTHEQUES = {
  'axios.min.js': 'https://unpkg.com/axios/dist/axios.min.js',
  'chart.js': 'https://cdn.jsdelivr.net/npm/chart.js@^3',
  'chartjs-adapter-moment': 'https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@^1',
  'html2canvas.min.js': 'https://unpkg.com/html2canvas/dist/html2canvas.min.js',
  'jquery-3.6.0.min.js': 'https://code.jquery.com/jquery-3.6.0.min.js',
  'jspdf.umd.min.js': 'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js',
  moment: 'https://cdn.jsdelivr.net/npm/moment@^2',
  'moment-locale-fr.js': 'https://cdn.jsdelivr.net/npm/moment/locale/fr.js',
  'purify.min.js': 'https://unpkg.com/dompurify/dist/purify.min.js',
};

const routesBibliotheques = () => {
  const routes = express.Router();

  routes.get('/:nomBibliotheque', (requete, reponse) => {
    const { nomBibliotheque } = requete.params;
    const chemin = CHEMINS_BIBLIOTHEQUES[nomBibliotheque];

    if (chemin) {
      axios.get(CHEMINS_BIBLIOTHEQUES[requete.params.nomBibliotheque])
        .then((reponseDepot) => reponse.type('text/javascript').send(reponseDepot.data));
    } else {
      reponse.status(404).send(`Bibliothèque inconnue : ${nomBibliotheque}`);
    }
  });

  return routes;
};

module.exports = routesBibliotheques;
