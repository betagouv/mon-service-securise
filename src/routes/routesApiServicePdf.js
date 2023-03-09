const express = require('express');

const routesApiServicePdf = (middleware, adaptateurPdf, adaptateurPdfHtml) => {
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

  routes.get('/:id/pdf/annexes', middleware.trouveHomologation, middleware.positionneHeadersAvecNonceEtFonts, (requete, reponse, suite) => {
    const { homologation, nonce } = requete;
    const donneesDescription = homologation.vueAnnexePDFDescription().donnees();
    const donneesMesures = homologation.vueAnnexePDFMesures().donnees();
    const donneesRisques = homologation.vueAnnexePDFRisques().donnees();

    adaptateurPdfHtml.genereAnnexes({
      donneesDescription,
      donneesMesures,
      donneesRisques,
      referentiel: homologation.referentiel,
      nonce,
    })
      .then((pdf) => reponse.contentType('application/pdf').send(pdf))
      .catch(suite);
  });

  routes.get('/:id/pdf/dossierDecision.pdf', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    const donnees = {
      nomService: homologation.nomService(),
      nomPrenomAutorite: homologation.dossierCourant().autorite.nom,
      fonctionAutorite: homologation.dossierCourant().autorite.fonction,
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

  routes.get('/:id/pdf/dossierDecision', (_requete, reponse) => {
    adaptateurPdfHtml.genereDossierDecision()
      .then((pdf) => reponse.contentType('application/pdf').send(pdf))
      .catch(() => reponse.sendStatus(424));
  });

  return routes;
};

module.exports = routesApiServicePdf;
