const express = require('express');
const { genereGradientConique } = require('../pdf/graphiques/camembert');

const routesApiServicePdf = (middleware, adaptateurPdf, referentiel) => {
  const routes = express.Router();

  routes.get('/:id/pdf/annexes.pdf', middleware.trouveService, (requete, reponse, suite) => {
    const { homologation } = requete;
    const donneesDescription = homologation.vueAnnexePDFDescription().donnees();
    const donneesMesures = homologation.vueAnnexePDFMesures().donnees();
    const donneesRisques = homologation.vueAnnexePDFRisques().donnees();

    adaptateurPdf.genereAnnexes({
      donneesDescription,
      donneesMesures,
      donneesRisques,
      referentiel,
    })
      .then((pdf) => reponse.contentType('application/pdf').send(pdf))
      .catch(suite);
  });

  routes.get('/:id/pdf/dossierDecision.pdf', middleware.trouveService, middleware.trouveDossierCourant, (requete, reponse) => {
    const { homologation, dossierCourant } = requete;

    const donnees = {
      nomService: homologation.nomService(),
      nomPrenomAutorite: dossierCourant.autorite.nom,
      fonctionAutorite: dossierCourant.autorite.fonction,
      indiceCyberTotal: homologation.indiceCyber().total,
      organisationResponsable: homologation.descriptionService.organisationsResponsables[0],
      referentiel,
      ...dossierCourant.avis.toJSON(),
      ...dossierCourant.documents.toJSON(),
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

  routes.get('/:id/pdf/syntheseSecurite.pdf', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;

    const donnees = {
      service: homologation,
      camembertIndispensables: genereGradientConique(
        homologation.statistiquesMesuresIndispensables()
      ),
      camembertRecommandees: genereGradientConique(
        homologation.statistiquesMesuresRecommandees()
      ),
      referentiel,
    };

    adaptateurPdf.genereSyntheseSecurite(donnees)
      .then((pdf) => reponse.contentType('application/pdf').send(pdf))
      .catch(() => reponse.sendStatus(424));
  });

  return routes;
};

module.exports = routesApiServicePdf;
