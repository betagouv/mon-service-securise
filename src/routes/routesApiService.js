const express = require('express');

const routesApiServicePdf = require('./routesApiServicePdf');
const {
  EchecAutorisation,
  ErreurModele,
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
} = require('../erreurs');
const ActeursHomologation = require('../modeles/acteursHomologation');
const AutorisationCreateur = require('../modeles/autorisations/autorisationCreateur');
const Avis = require('../modeles/avis');
const AvisExpertCyber = require('../modeles/avisExpertCyber');
const DescriptionService = require('../modeles/descriptionService');
const FonctionnalitesSpecifiques = require('../modeles/fonctionnalitesSpecifiques');
const DonneesSensiblesSpecifiques = require('../modeles/donneesSensiblesSpecifiques');
const MesureGenerale = require('../modeles/mesureGenerale');
const MesureSpecifique = require('../modeles/mesureSpecifique');
const MesuresSpecifiques = require('../modeles/mesuresSpecifiques');
const PartiesPrenantes = require('../modeles/partiesPrenantes/partiesPrenantes');
const PointsAcces = require('../modeles/pointsAcces');
const RisqueGeneral = require('../modeles/risqueGeneral');
const RisquesSpecifiques = require('../modeles/risquesSpecifiques');
const RolesResponsabilites = require('../modeles/rolesResponsabilites');
const { dateInvalide } = require('../utilitaires/date');
const { valeurBooleenne } = require('../utilitaires/aseptisation');

const routesApiService = (
  middleware,
  depotDonnees,
  referentiel,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurZip
) => {
  const routes = express.Router();

  routes.use(
    routesApiServicePdf(
      middleware,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip,
      referentiel
    )
  );

  routes.post(
    '/',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('nomService', 'organisationsResponsables.*'),
    middleware.aseptiseListes([
      { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
      {
        nom: 'fonctionnalitesSpecifiques',
        proprietes: FonctionnalitesSpecifiques.proprietesItem(),
      },
      {
        nom: 'donneesSensiblesSpecifiques',
        proprietes: DonneesSensiblesSpecifiques.proprietesItem(),
      },
    ]),
    (requete, reponse, suite) => {
      Promise.resolve()
        .then(() => new DescriptionService(requete.body, referentiel))
        .then((description) =>
          depotDonnees.nouvelleHomologation(requete.idUtilisateurCourant, {
            descriptionService: description.toJSON(),
          })
        )
        .then((idService) => reponse.json({ idService }))
        .catch((e) => {
          if (e instanceof ErreurNomServiceDejaExistant)
            reponse
              .status(422)
              .json({ erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } });
          else if (e instanceof ErreurModele)
            reponse.status(422).send(e.message);
          else suite(e);
        });
    }
  );

  routes.put(
    '/:id',
    middleware.trouveService,
    middleware.aseptise('nomService', 'organisationsResponsables.*'),
    middleware.aseptiseListes([
      { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
      {
        nom: 'fonctionnalitesSpecifiques',
        proprietes: FonctionnalitesSpecifiques.proprietesItem(),
      },
      {
        nom: 'donneesSensiblesSpecifiques',
        proprietes: DonneesSensiblesSpecifiques.proprietesItem(),
      },
    ]),
    (requete, reponse, suite) => {
      Promise.resolve()
        .then(() => new DescriptionService(requete.body, referentiel))
        .then((descriptionService) =>
          depotDonnees.ajouteDescriptionServiceAHomologation(
            requete.idUtilisateurCourant,
            requete.params.id,
            descriptionService
          )
        )
        .then(() => reponse.send({ idService: requete.homologation.id }))
        .catch((e) => {
          if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else suite(e);
        });
    }
  );

  routes.post(
    '/:id/mesures',
    middleware.trouveService,
    middleware.aseptise(
      'mesuresGenerales.*.statut',
      'mesuresGenerales.*.modalites',
      'mesuresSpecifiques.*.description',
      'mesuresSpecifiques.*.categorie',
      'mesuresSpecifiques.*.statut',
      'mesuresSpecifiques.*.modalites'
    ),
    (requete, reponse, suite) => {
      const { mesuresSpecifiques = [], mesuresGenerales = {} } = requete.body;
      const idService = requete.homologation.id;

      try {
        const generales = Object.keys(mesuresGenerales).map((idMesure) => {
          const { modalites, statut } = mesuresGenerales[idMesure];
          return new MesureGenerale(
            { id: idMesure, statut, modalites },
            referentiel
          );
        });

        const aPersister = mesuresSpecifiques.filter((mesure) =>
          MesureSpecifique.proprietesObligatoiresRenseignees(mesure)
        );
        const specifiques = new MesuresSpecifiques(
          { mesuresSpecifiques: aPersister },
          referentiel
        );

        depotDonnees
          .ajouteMesuresAHomologation(idService, generales, specifiques)
          .then(() => reponse.send({ idService }))
          .catch(suite);
      } catch {
        reponse.status(422).send('Données invalides');
      }
    }
  );

  routes.post(
    '/:id/rolesResponsabilites',
    middleware.trouveService,
    middleware.aseptiseListes([
      {
        nom: 'acteursHomologation',
        proprietes: ActeursHomologation.proprietesItem(),
      },
      {
        nom: 'partiesPrenantes',
        proprietes: PartiesPrenantes.proprietesItem(),
      },
    ]),
    (requete, reponse) => {
      const rolesResponsabilites = new RolesResponsabilites(requete.body);
      const idService = requete.homologation.id;
      depotDonnees
        .ajouteRolesResponsabilitesAHomologation(
          idService,
          rolesResponsabilites
        )
        .then(() => reponse.send({ idService }));
    }
  );

  routes.post(
    '/:id/risques',
    middleware.trouveService,
    middleware.aseptise(
      '*',
      'risquesSpecifiques.*.description',
      'risquesSpecifiques.*.niveauGravite',
      'risquesSpecifiques.*.commentaire'
    ),
    (requete, reponse, suite) => {
      const { risquesSpecifiques = [], ...params } = requete.body;
      const prefixeAttributRisque = /^(commentaire|niveauGravite)-/;
      const idService = requete.homologation.id;

      try {
        const donneesRisques = Object.keys(params)
          .filter((p) => p.match(prefixeAttributRisque))
          .reduce((acc, p) => {
            const idRisque = p.replace(prefixeAttributRisque, '');
            const nomAttribut = p.match(prefixeAttributRisque)[1];
            acc[idRisque] ||= {};
            Object.assign(acc[idRisque], {
              id: idRisque,
              [nomAttribut]: params[p],
            });
            return acc;
          }, {});

        const ajouts = Object.values(donneesRisques).reduce((acc, donnees) => {
          const risque = new RisqueGeneral(donnees, referentiel);
          return acc.then(() =>
            depotDonnees.ajouteRisqueGeneralAHomologation(idService, risque)
          );
        }, Promise.resolve());

        ajouts
          .then(() => {
            const aPersister = risquesSpecifiques.filter(
              (r) => r?.description || r?.commentaire || r?.niveauGravite
            );
            const listeRisquesSpecifiques = new RisquesSpecifiques(
              {
                risquesSpecifiques: aPersister,
              },
              referentiel
            );

            return depotDonnees.remplaceRisquesSpecifiquesPourHomologation(
              idService,
              listeRisquesSpecifiques
            );
          })
          .then(() => reponse.send({ idService }))
          .catch(suite);
      } catch {
        reponse.status(422).send('Données invalides');
      }
    }
  );

  routes.post(
    '/:id/avisExpertCyber',
    middleware.trouveService,
    (requete, reponse) => {
      try {
        const avisExpert = new AvisExpertCyber(requete.body, referentiel);
        depotDonnees
          .ajouteAvisExpertCyberAHomologation(
            requete.homologation.id,
            avisExpert
          )
          .then(() => reponse.send({ idService: requete.homologation.id }));
      } catch {
        reponse.status(422).send('Données invalides');
      }
    }
  );

  routes.put(
    '/:id/homologation/autorite',
    middleware.trouveService,
    middleware.trouveDossierCourant,
    middleware.aseptise('nom', 'fonction'),
    (requete, reponse, suite) => {
      const { homologation, dossierCourant } = requete;

      const {
        body: { nom, fonction },
      } = requete;
      dossierCourant.enregistreAutoriteHomologation(nom, fonction);
      depotDonnees
        .enregistreDossierCourant(homologation.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/decision',
    middleware.trouveService,
    middleware.trouveDossierCourant,
    middleware.aseptise('dateHomologation', 'dureeValidite'),
    (requete, reponse, suite) => {
      const { dateHomologation, dureeValidite } = requete.body;
      if (dateInvalide(dateHomologation)) {
        reponse.status(422).send("Date d'homologation invalide");
        return;
      }

      if (
        !referentiel.estIdentifiantEcheanceRenouvellementConnu(dureeValidite)
      ) {
        reponse.status(422).send('Durée de validité invalide');
        return;
      }

      const { homologation, dossierCourant } = requete;

      dossierCourant.enregistreDecision(dateHomologation, dureeValidite);
      depotDonnees
        .enregistreDossierCourant(homologation.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/telechargement',
    middleware.trouveService,
    middleware.trouveDossierCourant,
    (requete, reponse, suite) => {
      const { homologation, dossierCourant } = requete;

      const dateTelechargement = adaptateurHorloge.maintenant();
      dossierCourant.enregistreDateTelechargement(dateTelechargement);
      depotDonnees
        .enregistreDossierCourant(homologation.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/avis',
    middleware.trouveService,
    middleware.trouveDossierCourant,
    middleware.aseptiseListes([
      {
        nom: 'avis',
        proprietes: [
          ...Avis.proprietesAtomiquesRequises(),
          ...Avis.proprietesAtomiquesFacultatives(),
        ],
      },
    ]),
    middleware.aseptise('avis.*.collaborateurs.*', 'avecAvis'),
    (requete, reponse, suite) => {
      const {
        body: { avis },
      } = requete;
      if (!avis) {
        reponse.sendStatus(400);
        return;
      }

      const { homologation, dossierCourant } = requete;
      const avecAvis = valeurBooleenne(requete.body.avecAvis);

      if (avecAvis) dossierCourant.enregistreAvis(avis);
      else dossierCourant.declareSansAvis();

      depotDonnees
        .enregistreDossierCourant(homologation.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/documents',
    middleware.trouveService,
    middleware.trouveDossierCourant,
    middleware.aseptise('documents.*', 'avecDocuments'),
    (requete, reponse, suite) => {
      const {
        body: { documents },
      } = requete;
      if (!documents) {
        reponse.sendStatus(400);
        return;
      }

      const { homologation, dossierCourant } = requete;
      const avecDocuments = valeurBooleenne(requete.body.avecDocuments);

      if (avecDocuments) dossierCourant.enregistreDocuments(documents);
      else dossierCourant.declareSansDocument();

      depotDonnees
        .enregistreDossierCourant(homologation.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.post(
    '/:id/homologation/finalise',
    middleware.trouveService,
    middleware.trouveDossierCourant,
    (requete, reponse, suite) => {
      const { homologation, dossierCourant } = requete;

      dossierCourant.enregistreFinalisation();
      depotDonnees
        .finaliseDossier(homologation.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.delete(
    '/:id/autorisationContributeur',
    middleware.verificationAcceptationCGU,
    (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;
      const { idContributeur } = requete.body;

      const verifiePermissionSuppressionContributeur = (...params) =>
        depotDonnees
          .autorisationPour(...params)
          .then((a) =>
            a?.permissionSuppressionContributeur
              ? Promise.resolve()
              : Promise.reject(new EchecAutorisation())
          );

      verifiePermissionSuppressionContributeur(idUtilisateurCourant, idService)
        .then(() =>
          depotDonnees.supprimeContributeur(idContributeur, idService)
        )
        .then(() =>
          reponse.send(
            `Contributeur "${idContributeur}" supprimé pour l'homologation "${idService}"`
          )
        )
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse
              .status(403)
              .send(
                `Droits insuffisants pour supprimer un collaborateur du service "${idService}"`
              );
          } else if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else {
            suite(e);
          }
        });
    }
  );

  routes.delete(
    '/:id',
    middleware.verificationAcceptationCGU,
    (requete, reponse, suite) => {
      const verifiePermissionSuppressionService = (idUtilisateur, idService) =>
        depotDonnees
          .autorisationPour(idUtilisateur, idService)
          .then((autorisation) =>
            autorisation?.permissionSuppressionService
              ? Promise.resolve()
              : Promise.reject(new EchecAutorisation())
          );

      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;

      verifiePermissionSuppressionService(idUtilisateurCourant, idService)
        .then(() => depotDonnees.supprimeHomologation(idService))
        .then(() => reponse.send('Service supprimé'))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse
              .status(403)
              .send('Droits insuffisants pour supprimer le service');
          } else {
            suite(e);
          }
        });
    }
  );

  routes.copy(
    '/:id',
    middleware.verificationAcceptationCGU,
    (requete, reponse, suite) => {
      const verifiePermissionDuplicationService = (idUtilisateur, idService) =>
        depotDonnees
          .autorisationPour(idUtilisateur, idService)
          .then((autorisation) =>
            autorisation instanceof AutorisationCreateur
              ? Promise.resolve()
              : Promise.reject(new EchecAutorisation())
          );

      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;

      verifiePermissionDuplicationService(idUtilisateurCourant, idService)
        .then(() => depotDonnees.dupliqueHomologation(idService))
        .then(() => reponse.send('Service dupliqué'))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse
              .status(403)
              .send('Droits insuffisants pour dupliquer le service');
          } else if (e instanceof ErreurDonneesObligatoiresManquantes) {
            reponse.status(424).send({
              type: 'DONNEES_OBLIGATOIRES_MANQUANTES',
              message:
                'La duplication a échoué car certaines données obligatoires ne sont pas renseignées',
            });
          } else {
            suite(e);
          }
        });
    }
  );

  return routes;
};

module.exports = routesApiService;
