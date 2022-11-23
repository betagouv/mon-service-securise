const express = require('express');

const routesPdf = (adaptateurPdf) => {
  const routes = express.Router();

  routes.get('/:id/annexeMesures.pdf', (_requete, reponse, suite) => {
    const echantillonDonnees = {
      categorie: 'GOUVERNANCE',
      mesure: {
        description: 'Héberger le service numérique et les données au sein de l&#39;Union européenne',
      },
    };
    adaptateurPdf.genereAnnexeMesures(echantillonDonnees)
      .then((pdf) => {
        reponse.contentType('application/pdf');
        reponse.send(pdf);
      })
      .catch(suite);
  });

  return routes;
};

module.exports = routesPdf;
