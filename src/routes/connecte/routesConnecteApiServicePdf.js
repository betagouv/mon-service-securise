import express from 'express';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { genereGradientConique } from '../../pdf/graphiques/camembert.js';
import { dateYYYYMMDD } from '../../utilitaires/date.js';

const routesConnecteApiServicePdf = ({
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurZip,
  middleware,
  referentiel,
}) => {
  const routes = express.Router();

  const generePdfAnnexes = (service) => {
    const donneesDescription = service.vueAnnexePDFDescription().donnees();
    const donneesMesures = service.vueAnnexePDFMesures().donnees();
    const donneesRisques = service.vueAnnexePDFRisques().donnees();

    return adaptateurPdf.genereAnnexes({
      donneesDescription,
      donneesMesures,
      donneesRisques,
      referentiel,
    });
  };

  const generePdfDossierDecision = (service, dossierCourant) => {
    const donnees = {
      nomService: service.nomService(),
      nomPrenomAutorite: dossierCourant.autorite.nom,
      fonctionAutorite: dossierCourant.autorite.fonction,
      indiceCyberTotal: service.indiceCyber().total,
      organisationResponsable:
        service.descriptionService.organisationResponsable.nom,
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

    const niveauSuperieurAuxRecommandations =
      service.niveauSecuriteDepasseRecommandation();
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
      niveauRecommande: service.estimeNiveauDeSecurite(),
      niveauSuperieurAuxRecommandations,
    };

    return adaptateurPdf.genereSyntheseSecurite(donnees);
  };
  routes.get(
    '/:id/pdf/annexes.pdf',
    middleware.trouveService(Autorisation.DROITS_ANNEXES_PDF),
    (requete, reponse, suite) => {
      const { service } = requete;

      generePdfAnnexes(service)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/dossierDecision.pdf',
    middleware.trouveService(Autorisation.DROITS_DOSSIER_DECISION_PDF),
    middleware.trouveDossierCourant,
    (requete, reponse, suite) => {
      const { service, dossierCourant } = requete;

      generePdfDossierDecision(service, dossierCourant)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/syntheseSecurite.pdf',
    middleware.trouveService(Autorisation.DROIT_SYNTHESE_SECURITE_PDF),
    (requete, reponse, suite) => {
      const { service } = requete;

      generePdfSyntheseSecurite(service)
        .then((pdf) => reponse.contentType('application/pdf').send(pdf))
        .catch(suite);
    }
  );

  routes.get(
    '/:id/pdf/documentsHomologation.zip',
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    async (requete, reponse, suite) => {
      const { service, autorisationService } = requete;

      const genereUnDocument = (idDocument) => {
        const references = {
          annexes: {
            pdf: () => generePdfAnnexes(service),
            nom: () => 'Annexes.pdf',
          },
          dossierDecision: {
            pdf: () =>
              generePdfDossierDecision(service, service.dossierCourant()),
            nom: () => 'DossierDecision.pdf',
          },
          syntheseSecurite: {
            pdf: () => generePdfSyntheseSecurite(service),
            nom: () => 'SyntheseSecurite.pdf',
          },
        };

        return references[idDocument]
          .pdf()
          .then((buffer) => ({ nom: references[idDocument].nom(), buffer }));
      };

      Promise.all(
        service
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
        const { service } = requete;
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

export default routesConnecteApiServicePdf;
