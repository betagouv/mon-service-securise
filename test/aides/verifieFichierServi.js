import expect from 'expect.js';
import supertest from 'supertest';

const echappePourRegex = (texte) =>
  texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const verifieNomFichierServi = async (app, url, nom) => {
  const reponse = await supertest(app).get(url);
  // Les guillemets sont optionnels (RFC 6266) quand le nom est un token HTTP valide
  const filenameAvecOuSansGuillemets = new RegExp(
    `filename=("${echappePourRegex(nom)}"|${echappePourRegex(nom)})(;|$)`
  );
  expect(reponse.headers['content-disposition']).to.match(
    filenameAvecOuSansGuillemets
  );
};

const verifieTypeFichierServi = async (app, url, typeFichier) => {
  const reponse = await supertest(app).get(url);
  expect(reponse.headers['content-type']).to.contain(typeFichier);
};

const verifieTypeFichierServiEstCSV = async (app, url) =>
  verifieTypeFichierServi(app, url, 'text/csv');

const verifieTypeFichierServiEstPDF = (app, url) =>
  verifieTypeFichierServi(app, url, 'application/pdf');

const verifieTypeFichierServiEstZIP = (app, url) =>
  verifieTypeFichierServi(app, url, 'application/zip');

const verifieTypeFichierServiEstPPTX = (app, url) =>
  verifieTypeFichierServi(
    app,
    url,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  );

export {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
  verifieTypeFichierServiEstPDF,
  verifieTypeFichierServiEstPPTX,
  verifieTypeFichierServiEstZIP,
};
