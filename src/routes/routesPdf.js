const express = require('express');
const fs = require('fs');
const pdflatex = require('node-pdflatex').default;

const routesPdf = (middleware) => {
  const routes = express.Router();

  routes.get('/:id/annexesMesures.pdf',
    middleware.trouveHomologation,
    (_requete, reponse, suite) => {
      fs.readFile('src/latex/vues/annexesMesures.tex', (_erreurs, donnees) => {
        pdflatex(donnees)
          .then((pdf) => {
            reponse.contentType('application/pdf');
            reponse.send(pdf);
          })
          .catch(suite);
      });
    });

  return routes;
};

module.exports = routesPdf;
