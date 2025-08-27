const axios = require('axios');
const expect = require('expect.js');
const supertest = require('supertest');

const verifieNomFichierServi = async (app, url, nom) => {
  const reponse = await supertest(app).get(url);
  expect(reponse.headers['content-disposition']).to.contain(
    `filename="${nom}"`
  );
};

const verifieTypeFichierServi = async (app, url, typeFichier) => {
  const reponse = await supertest(app).get(url);
  expect(reponse.headers['content-type']).to.contain(typeFichier);
};

const verifieTypeFichierServiEstCSV = async (app, url) =>
  verifieTypeFichierServi(app, url, 'text/csv');

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
