const axios = require('axios');

const requeteSansRedirection = async (url) =>
  axios.get(url, {
    validateStatus: () => true, // pour ne pas qu’un statut 302 lance une erreur
    maxRedirects: 0,
  });

const donneesPartagees = (contenuHtml, idScript) => {
  try {
    const regExp = new RegExp(
      `<script id="${idScript}" type="application/json">(.*?)</script>`
    );
    const match = contenuHtml.match(regExp);
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
};

module.exports = { requeteSansRedirection, donneesPartagees };
