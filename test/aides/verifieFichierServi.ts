const axios = require('axios');
const expect = require('expect.js');

const verifieNomFichierServi = (url, nom, done) =>
  axios
    .get(url)
    .then((reponse) =>
      expect(reponse.headers['content-disposition']).to.contain(
        `filename="${nom}"`
      )
    )
    .then(() => done())
    .catch(done);

const verifieTypeFichierServi = (url, done, typeFichier) =>
  axios
    .get(url)
    .then((reponse) =>
      expect(reponse.headers['content-type']).to.contain(typeFichier)
    )
    .then(() => done())
    .catch(done);

const verifieTypeFichierServiEstCSV = (url, done) =>
  verifieTypeFichierServi(url, done, 'text/csv');

const verifieTypeFichierServiEstPDF = (url, done) =>
  verifieTypeFichierServi(url, done, 'application/pdf');

const verifieTypeFichierServiEstZIP = (url, done) =>
  verifieTypeFichierServi(url, done, 'application/zip');

module.exports = {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
  verifieTypeFichierServiEstPDF,
  verifieTypeFichierServiEstZIP,
};
