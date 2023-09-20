const express = require('express');
const AutorisationBase = require('../../modeles/autorisations/autorisationBase');
const { genereGradientConique } = require('../../pdf/graphiques/camembert');
const { dateYYYYMMDD } = require('../../utilitaires/date');

const routesApiServicePdf = (
  middleware,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurZip,
  referentiel
) => {
  const routes = express.Router();

  const generePdfAnnexes = (homologation) => {
    const donneesDescription = homologation.vueAnnexePDFDescription().donnees();
    const donneesMesures = homologation.vueAnnexePDFMesures().donnees();
    const donneesRisques = homologation.vueAnnexePDFRisques().donnees();

    return adaptateurPdf.genereAnnexes({
      donneesDescription,
      donneesMesures,
      donneesRisques,
      referentiel,
    });
  };

  const generePdfDossierDecision = (homologation, dossierCourant) => {
    const donnees = {
      nomService: homologation.nomService(),
      nomPrenomAutorite: dossierCourant.autorite.nom,
      fonctionAutorite: dossierCourant.autorite.fonction,
      indiceCyberTotal: homologation.indiceCyber().total,
      organisationResponsable:
        homologation.descriptionService.organisationsResponsables[0],
      referentiel,
      ...dossierCourant.avis.toJSON(),
      ...dossierCourant.documents.toJSON(),
    };

    return adaptateurPdf.genereDossierDecision(donnees);
  };

  const generePdfSyntheseSecurite = (homologation) => {
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

    return adaptateurPdf.genereSyntheseSecurite(donnees);
  };
  routes.get(
    '/:id/pdf/annexes.pdf',
    middleware.trouveService(AutorisationBase.DROITS_ANNEXES_PDF),
    (requete, reponse, suite) => {
      const { homologation } = requete;

      generePdfAnnexes(homologation)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/dossierDecision.pdf',
    middleware.trouveService(AutorisationBase.DROITS_DOSSIER_DECISION_PDF),
    middleware.trouveDossierCourant,
    (requete, reponse, suite) => {
      const { homologation, dossierCourant } = requete;

      generePdfDossierDecision(homologation, dossierCourant)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/syntheseSecurite.pdf',
    middleware.trouveService(AutorisationBase.DROIT_SYNTHESE_SECURITE_PDF),
    (requete, reponse, suite) => {
      const { homologation } = requete;

      generePdfSyntheseSecurite(homologation)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/documentsHomologation.zip',
    middleware.trouveService({}),
    (requete, reponse, suite) => {
      const { homologation } = requete;

      const genereUnDocument = (idDocument) => {
        const references = {
          annexes: {
            pdf: () => generePdfAnnexes(homologation),
            nom: () => 'Annexes.pdf',
          },
          dossierDecision: {
            pdf: () =>
              generePdfDossierDecision(
                homologation,
                homologation.dossierCourant()
              ),
            nom: () => 'DossierDecision.pdf',
          },
          syntheseSecurite: {
            pdf: () => generePdfSyntheseSecurite(homologation),
            nom: () => 'SyntheseSecurite.pdf',
          },
        };

        return references[idDocument]
          .pdf()
          .then((buffer) => ({ nom: references[idDocument].nom(), buffer }));
      };

      Promise.all(
        homologation.documentsPdfDisponibles().map((d) => genereUnDocument(d))
      )
        .then((pdfs) => adaptateurZip.genereArchive(pdfs))
        .then((archive) => {
          const maintenantFormate = dateYYYYMMDD(
            adaptateurHorloge.maintenant()
          );
          reponse
            .contentType('application/zip')
            .set(
              'Content-Disposition',
              `attachment; filename="MSS_decision_${maintenantFormate}.zip"`
            )
            .send(archive);
        })
        .catch(suite);
    }
  );

  return routes;
};

module.exports = routesApiServicePdf;
