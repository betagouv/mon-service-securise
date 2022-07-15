const axios = require('axios');
const express = require('express');

const routesBibliotheques = () => {
  const routes = express.Router();

  routes.get('/jquery-3.6.0.min.js', (_requete, reponse) => {
    axios.get('https://code.jquery.com/jquery-3.6.0.min.js')
      .then((reponseJquery) => reponse.type('text/javascript').send(reponseJquery.data));
  });

  routes.get('/axios.min.js', (_requete, reponse) => {
    axios.get('https://unpkg.com/axios/dist/axios.min.js')
      .then((reponseAxios) => reponse.type('text/javascript').send(reponseAxios.data));
  });

  return routes;
};

module.exports = routesBibliotheques;
