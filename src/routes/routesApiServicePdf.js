const express = require('express');
const { genereGradientConique } = require('../pdf/graphiques/camembert');
const { dateYYYYMMDD } = require('../utilitaires/date');

const routesApiServicePdf = (middleware, adaptateurHorloge, adaptateurPdf, referentiel) => {
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

  routes.get('/:id/pdf/dossierDecision.pdf', middleware.trouveService, middleware.trouveDossierCourant, (requete, reponse, suite) => {
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
      .then((pdf) => reponse.contentType('application/pdf').send(pdf))
      .catch(suite);
  });

  routes.get('/:id/pdf/syntheseSecurite.pdf', middleware.trouveService, (requete, reponse, suite) => {
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
      .catch(suite);
  });

  routes.get('/:id/pdf/documentsHomologation.zip', middleware.trouveService, middleware.trouveDossierCourant, (requete, reponse, suite) => {
    const { homologation, dossierCourant } = requete;

    const donnees = {
      donneesDescription: homologation.vueAnnexePDFDescription().donnees(),
      donneesMesures: homologation.vueAnnexePDFMesures().donnees(),
      donneesRisques: homologation.vueAnnexePDFRisques().donnees(),
      nomService: homologation.nomService(),
      nomPrenomAutorite: dossierCourant.autorite.nom,
      fonctionAutorite: dossierCourant.autorite.fonction,
      indiceCyberTotal: homologation.indiceCyber().total,
      organisationResponsable: homologation.descriptionService.organisationsResponsables[0],
      service: homologation,
      camembertIndispensables: genereGradientConique(
        homologation.statistiquesMesuresIndispensables()
      ),
      camembertRecommandees: genereGradientConique(
        homologation.statistiquesMesuresRecommandees()
      ),
      referentiel,
      ...dossierCourant.avis.toJSON(),
      ...dossierCourant.documents.toJSON(),
    };

    adaptateurPdf.genereArchiveTousDocuments(donnees)
      .then((archive) => {
        const maintenantFormate = dateYYYYMMDD(adaptateurHorloge.maintenant());
        reponse
          .contentType('application/zip')
          .set('Content-Disposition', `attachment; filename="MSS_decision_${maintenantFormate}.zip"`)
          .send(archive);
      })
      .catch(suite);
  });

  return routes;
};

module.exports = routesApiServicePdf;
