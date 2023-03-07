const express = require('express');

const { genereAnnexesAvisDossierDecision } = require('../adaptateurs/adaptateurPdf');

const routesApiServicePdf = (middleware, adaptateurPdf) => {
  const routes = express.Router();

  routes.get('/:id/pdf/annexes.pdf', middleware.trouveHomologation, (requete, reponse, suite) => {
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

  routes.get('/:id/pdf/dossierDecision.pdf', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    const donnees = {
      nomService: homologation.nomService(),
      nomPrenomAutorite: homologation.dossierCourant().autorite.nom,
      fonctionAutorite: homologation.dossierCourant().autorite.fonction,
      ...homologation.dossierCourant().avis.toJSON(),
    };

    adaptateurPdf.genereDossierDecision(donnees)
      .then((pdf) => {
        reponse.contentType('application/pdf');
        reponse.send(pdf);
      })
      .catch(() => {
        reponse.sendStatus(424);
      });
  });

  routes.get('/:id/pdf/poc.pdf', (_requete, reponse) => {
    genereAnnexesAvisDossierDecision().then((pdf) => {
      reponse.contentType('application/pdf');
      reponse.send(pdf);
    });
  });

  return routes;
};

module.exports = routesApiServicePdf;
