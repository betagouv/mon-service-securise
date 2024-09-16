const axios = require('axios');

const requeteSansRedirection = async (url) =>
  axios.get(url, {
    validateStatus: () => true, // pour ne pas qu’un statut 302 lance une erreur
    maxRedirects: 0,
  });

module.exports = { requeteSansRedirection };
