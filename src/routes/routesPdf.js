const express = require('express');

const routesPdf = (middleware, adaptateurPdf) => {
  const routes = express.Router();

  routes.get('/:id/annexeMesures.pdf', middleware.trouveHomologation, (requete, reponse, suite) => {
    const { homologation } = requete;
    const mesuresParStatut = homologation.mesuresParStatut();
    const statuts = { enCours: 'En cours', nonFait: 'Non fait', fait: 'Fait' };
    const donnees = {
      statuts,
      mesuresParStatut,
      CHEMIN_BASE_ABSOLU: process.env.CHEMIN_BASE_ABSOLU,
    };
    adaptateurPdf.genereAnnexeMesures(donnees)
      .then((pdf) => {
        reponse.contentType('application/pdf');
        reponse.send(pdf);
      })
      .catch(suite);
  });

  return routes;
};

module.exports = routesPdf;
