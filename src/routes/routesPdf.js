const express = require('express');

const routesPdf = (adaptateurPdf) => {
  const routes = express.Router();

  routes.get('/:id/annexeMesures.pdf', (_requete, reponse, suite) => {
    adaptateurPdf.genereAnnexeMesures()
      .then((pdf) => {
        reponse.contentType('application/pdf');
        reponse.send(pdf);
      })
      .catch(suite);
  });

  return routes;
};

module.exports = routesPdf;
