const express = require('express');

const routesPdf = (middleware, adaptateurPdf) => {
  const routes = express.Router();

  routes.get('/:id/annexes.pdf', middleware.trouveHomologation, (requete, reponse, suite) => {
    const { homologation } = requete;
    const donneesDescription = homologation.vueAnnexePDFDescription().donnees();
    const donneesRisques = homologation.vueAnnexePDFRisques().donnees();
    const donneesMesures = homologation.vueAnnexePDFMesures().donnees();

    adaptateurPdf.genereAnnexes({ donneesDescription, donneesMesures, donneesRisques })
      .then((pdf) => {
        reponse.contentType('application/pdf');
        reponse.send(pdf);
      })
      .catch(suite);
  });

  routes.get('/:id/dossierDecision.pdf', (_requete, reponse, suite) => {
    adaptateurPdf.genereDossierDecision()
      .then((pdf) => {
        reponse.contentType('application/pdf');
        reponse.send(pdf);
      })
      .catch(suite);
  });

  return routes;
};

module.exports = routesPdf;
