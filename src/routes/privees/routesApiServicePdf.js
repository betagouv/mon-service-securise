const express = require('express');
const Autorisation = require('../../modeles/autorisations/autorisation');
const { genereGradientConique } = require('../../pdf/graphiques/camembert');
const { dateYYYYMMDD } = require('../../utilitaires/date');

const routesApiServicePdf = ({
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurZip,
  middleware,
  referentiel,
}) => {
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
        homologation.descriptionService.organisationResponsable.nom,
      referentiel,
      ...dossierCourant.avis.toJSON(),
      ...dossierCourant.documents.toJSON(),
    };

    return adaptateurPdf.genereDossierDecision(donnees);
  };

  const generePdfSyntheseSecurite = (service) => {
    const referentiels = Object.entries(
      service.mesures.enrichiesAvecDonneesPersonnalisees().mesuresGenerales
    ).map(([_, mesure]) => mesure.referentiel);
    const referentielConcernes =
      referentiel.formatteListeDeReferentiels(referentiels);
    const donnees = {
      service,
      camembertIndispensables: genereGradientConique(
        service.statistiquesMesuresIndispensables()
      ),
      camembertRecommandees: genereGradientConique(
        service.statistiquesMesuresRecommandees()
      ),
      referentielConcernes,
      referentiel,
    };

    return adaptateurPdf.genereSyntheseSecurite(donnees);
  };
  routes.get(
    '/:id/pdf/annexes.pdf',
    middleware.trouveService(Autorisation.DROITS_ANNEXES_PDF),
    (requete, reponse, suite) => {
      const { homologation } = requete;

      generePdfAnnexes(homologation)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/dossierDecision.pdf',
    middleware.trouveService(Autorisation.DROITS_DOSSIER_DECISION_PDF),
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
    middleware.trouveService(Autorisation.DROIT_SYNTHESE_SECURITE_PDF),
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
    middleware.chargeAutorisationsService,
    async (requete, reponse, suite) => {
      const { homologation, autorisationService } = requete;

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
        homologation
          .documentsPdfDisponibles(autorisationService)
          .map((d) => genereUnDocument(d))
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

  routes.get(
    '/:id/archive/tamponHomologation.zip',
    middleware.trouveService(Autorisation.DROIT_TAMPON_HOMOLOGATION_ZIP),
    async (requete, reponse, suite) => {
      try {
        const { homologation: service } = requete;
        if (!service.dossiers.dossierActif()) {
          reponse.status(422).send("Le service n'a pas d'homologation active");
          return;
        }

        const fichiers = await adaptateurPdf.genereTamponHomologation({
          service,
          dossier: service.dossiers.dossierActif(),
          referentiel,
        });
        const archive = await adaptateurZip.genereArchive(fichiers);

        // On omet volontairement le nom du service car on rencontre de nombreux soucis de formattage
        // (accents, emoji, troncature, etc..)
        const nomFichier = 'MSS_tampon_homologation.zip';
        reponse
          .contentType('application/zip')
          .attachment(nomFichier)
          .send(archive);
      } catch (e) {
        suite(e);
      }
    }
  );

  return routes;
};

module.exports = routesApiServicePdf;
