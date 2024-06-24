const express = require('express');

const routesConnecteApiServicePdf = require('./routesConnecteApiServicePdf');
const {
  EchecAutorisation,
  ErreurModele,
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
  ErreurDossierCourantInexistant,
  ErreurMesureInconnue,
  ErreurStatutMesureInvalide,
} = require('../../erreurs');
const ActeursHomologation = require('../../modeles/acteursHomologation');
const Avis = require('../../modeles/avis');
const DescriptionService = require('../../modeles/descriptionService');
const FonctionnalitesSpecifiques = require('../../modeles/fonctionnalitesSpecifiques');
const DonneesSensiblesSpecifiques = require('../../modeles/donneesSensiblesSpecifiques');
const MesureGenerale = require('../../modeles/mesureGenerale');
const MesureSpecifique = require('../../modeles/mesureSpecifique');
const MesuresSpecifiques = require('../../modeles/mesuresSpecifiques');
const PartiesPrenantes = require('../../modeles/partiesPrenantes/partiesPrenantes');
const PointsAcces = require('../../modeles/pointsAcces');
const RisqueGeneral = require('../../modeles/risqueGeneral');
const RisquesSpecifiques = require('../../modeles/risquesSpecifiques');
const RolesResponsabilites = require('../../modeles/rolesResponsabilites');
const { dateInvalide } = require('../../utilitaires/date');
const { valeurBooleenne } = require('../../utilitaires/aseptisation');
const objetGetService = require('../../modeles/objetsApi/objetGetService');
const objetGetAutorisation = require('../../modeles/objetsApi/objetGetAutorisation');

const {
  Permissions,
  Rubriques,
  verifieCoherenceDesDroits,
} = require('../../modeles/autorisations/gestionDroits');
const objetGetMesures = require('../../modeles/objetsApi/objetGetMesures');
const EvenementRetourUtilisateurMesure = require('../../modeles/journalMSS/evenementRetourUtilisateurMesure');

const { ECRITURE, LECTURE } = Permissions;
const { CONTACTS, SECURISER, RISQUES, HOMOLOGUER, DECRIRE } = Rubriques;

const routesConnecteApiService = ({
  middleware,
  depotDonnees,
  referentiel,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurZip,
  adaptateurJournalMSS,
}) => {
  const routes = express.Router();

  routes.use(
    routesConnecteApiServicePdf({
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip,
      middleware,
      referentiel,
    })
  );

  routes.post(
    '/',
    middleware.protegeTrafic(),
    middleware.verificationAcceptationCGU,
    middleware.aseptise(
      'nomService',
      'organisationsResponsables.*',
      'nombreOrganisationsUtilisatrices.*'
    ),
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
    async (requete, reponse, suite) => {
      try {
        const description = new DescriptionService(requete.body, referentiel);

        const idService = await depotDonnees.nouveauService(
          requete.idUtilisateurCourant,
          { descriptionService: description.toJSON() }
        );

        reponse.json({ idService });
      } catch (e) {
        if (e instanceof ErreurNomServiceDejaExistant)
          reponse
            .status(422)
            .json({ erreur: { code: 'NOM_SERVICE_DEJA_EXISTANT' } });
        else if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
      }
    }
  );

  routes.put(
    '/:id',
    middleware.trouveService({ [DECRIRE]: ECRITURE }),
    middleware.aseptise(
      'nomService',
      'organisationsResponsables.*',
      'nombreOrganisationsUtilisatrices.*'
    ),
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
    async (requete, reponse, suite) => {
      try {
        const descriptionService = new DescriptionService(
          requete.body,
          referentiel
        );

        await depotDonnees.ajouteDescriptionService(
          requete.idUtilisateurCourant,
          requete.params.id,
          descriptionService
        );

        reponse.send({ idService: requete.service.id });
      } catch (e) {
        if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
      }
    }
  );

  routes.post(
    '/estimationNiveauSecurite',
    middleware.verificationAcceptationCGU,
    middleware.aseptise(
      'nomService',
      'organisationsResponsables.*',
      'nombreOrganisationsUtilisatrices.*'
    ),
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
    async (requete, reponse, suite) => {
      try {
        const descriptionService = new DescriptionService(
          requete.body,
          referentiel
        );

        reponse.json({
          niveauDeSecuriteMinimal:
            DescriptionService.estimeNiveauDeSecurite(descriptionService),
        });
      } catch (e) {
        if (e instanceof ErreurModele)
          reponse.status(400).send('La description du service est invalide');
        else suite(e);
      }
    }
  );

  routes.get(
    '/:id',
    middleware.aseptise('id'),
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    async (requete, reponse) => {
      const donnees = objetGetService.donnees(
        requete.service,
        requete.autorisationService,
        referentiel
      );
      reponse.json(donnees);
    }
  );

  routes.get(
    '/:id/mesures',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    (requete, reponse) => {
      const { service } = requete;

      reponse.json(objetGetMesures.donnees(service));
    }
  );

  routes.put(
    '/:id/mesures/:idMesure',
    middleware.verificationAcceptationCGU,
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    middleware.aseptise('statut', 'modalites'),
    async (requete, reponse, suite) => {
      const { service, body, params } = requete;
      try {
        service.metAJourMesure({
          ...body,
          id: params.idMesure,
        });
        await depotDonnees.metsAJourService(service);
        reponse.sendStatus(200);
      } catch (e) {
        if (
          e instanceof ErreurMesureInconnue ||
          e instanceof ErreurStatutMesureInvalide
        ) {
          reponse.status(400).send('La mesure est invalide.');
          return;
        }
        suite(e);
      }
    }
  );

  routes.post(
    '/:id/mesures',
    middleware.trouveService({ [SECURISER]: ECRITURE }),
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
      const idService = requete.service.id;
      const idUtilisateur = requete.idUtilisateurCourant;

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
          .ajouteMesuresAuService(
            idService,
            idUtilisateur,
            generales,
            specifiques
          )
          .then(() => reponse.send({ idService }))
          .catch(suite);
      } catch {
        reponse.status(422).send('Données invalides');
      }
    }
  );

  routes.post(
    '/:id/rolesResponsabilites',
    middleware.trouveService({ [CONTACTS]: ECRITURE }),
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
      const idService = requete.service.id;
      depotDonnees
        .ajouteRolesResponsabilitesAService(idService, rolesResponsabilites)
        .then(() => reponse.send({ idService }));
    }
  );

  routes.post(
    '/:id/risques',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    middleware.aseptise(
      '*',
      'risquesSpecifiques.*.description',
      'risquesSpecifiques.*.niveauGravite',
      'risquesSpecifiques.*.commentaire'
    ),
    (requete, reponse, suite) => {
      const { risquesSpecifiques = [], ...params } = requete.body;
      const prefixeAttributRisque = /^(commentaire|niveauGravite)-/;
      const idService = requete.service.id;

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
            depotDonnees.ajouteRisqueGeneralAService(idService, risque)
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

            return depotDonnees.remplaceRisquesSpecifiquesDuService(
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

  routes.put(
    '/:id/homologation/autorite',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    middleware.aseptise('nom', 'fonction'),
    (requete, reponse, suite) => {
      const { service, dossierCourant } = requete;

      const {
        body: { nom, fonction },
      } = requete;
      dossierCourant.enregistreAutoriteHomologation(nom, fonction);
      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/decision',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
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

      const { service, dossierCourant } = requete;

      dossierCourant.enregistreDecision(dateHomologation, dureeValidite);
      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/telechargement',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.trouveDossierCourant,
    (requete, reponse, suite) => {
      const { service, dossierCourant } = requete;

      const dateTelechargement = adaptateurHorloge.maintenant();
      dossierCourant.enregistreDateTelechargement(dateTelechargement);
      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/avis',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
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

      const { service, dossierCourant } = requete;
      const avecAvis = valeurBooleenne(requete.body.avecAvis);

      if (avecAvis) dossierCourant.enregistreAvis(avis);
      else dossierCourant.declareSansAvis();

      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.put(
    '/:id/homologation/documents',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
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

      const { service, dossierCourant } = requete;
      const avecDocuments = valeurBooleenne(requete.body.avecDocuments);

      if (avecDocuments) dossierCourant.enregistreDocuments(documents);
      else dossierCourant.declareSansDocument();

      depotDonnees
        .enregistreDossier(service.id, dossierCourant)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.post(
    '/:id/homologation/finalise',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    (requete, reponse, suite) => {
      const { service } = requete;

      depotDonnees
        .finaliseDossierCourant(service)
        .then(() => reponse.sendStatus(204))
        .catch(suite);
    }
  );

  routes.delete(
    '/:id/homologation/dossierCourant',
    middleware.trouveService({ [HOMOLOGUER]: ECRITURE }),
    middleware.challengeMotDePasse,
    async (requete, reponse, suite) => {
      const { service } = requete;
      try {
        service.supprimeDossierCourant();
        await depotDonnees.metsAJourService(service);
        reponse.sendStatus(204);
      } catch (e) {
        if (e instanceof ErreurDossierCourantInexistant)
          reponse.status(422).send(e.message);
        else suite(e);
      }
    }
  );

  routes.delete(
    '/:id',
    middleware.trouveService({}),
    middleware.challengeMotDePasse,
    middleware.chargeAutorisationsService,
    (requete, reponse, suite) => {
      const verifiePermissionSuppressionService = () =>
        requete.autorisationService.peutSupprimerService()
          ? Promise.resolve()
          : Promise.reject(new EchecAutorisation());

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
    middleware.protegeTrafic(),
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    (requete, reponse, suite) => {
      const verifiePermissionDuplicationService = () =>
        requete.autorisationService.peutDupliquer()
          ? Promise.resolve()
          : Promise.reject(new EchecAutorisation());

      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;

      verifiePermissionDuplicationService(idUtilisateurCourant, idService)
        .then(() =>
          depotDonnees.dupliqueService(idService, idUtilisateurCourant)
        )
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

  routes.get(
    '/:id/autorisations',
    middleware.trouveService({}),
    middleware.aseptise('id'),
    async (requete, reponse) => {
      const { id: idService } = requete.service;
      let autorisations = await depotDonnees.autorisationsDuService(idService);

      const autorisationUtilisateurCourant = autorisations.find(
        (a) => a.idUtilisateur === requete.idUtilisateurCourant
      );

      if (!autorisationUtilisateurCourant.peutGererContributeurs()) {
        autorisations = autorisations.filter(
          (a) =>
            a.estProprietaire ||
            a.idUtilisateur === requete.idUtilisateurCourant
        );
      }

      reponse.json(autorisations.map((a) => objetGetAutorisation.donnees(a)));
    }
  );

  routes.patch(
    '/:id/autorisations/:idAutorisation',
    middleware.trouveService({}),
    middleware.chargeAutorisationsService,
    middleware.aseptise('id', 'idAutorisation'),
    async (requete, reponse) => {
      const { autorisationService, idUtilisateurCourant } = requete;
      const { idAutorisation } = requete.params;
      const nouveauxDroits = requete.body.droits;

      if (!verifieCoherenceDesDroits(nouveauxDroits)) {
        reponse.status(422).json({ code: 'DROITS_INCOHERENTS' });
        return;
      }

      if (!autorisationService.peutGererContributeurs()) {
        reponse.status(403).json({ code: 'INTERDIT' });
        return;
      }

      const ciblee = await depotDonnees.autorisation(idAutorisation);
      if (ciblee.idUtilisateur === idUtilisateurCourant) {
        reponse.status(422).json({ code: 'AUTO-MODIFICATION_INTERDITE' });
        return;
      }

      const { service } = requete;
      const cibleUnServiceDifferent = ciblee.idService !== service.id;
      if (cibleUnServiceDifferent) {
        reponse.status(422).json({ code: 'LIEN_INCOHERENT' });
        return;
      }

      ciblee.appliqueDroits(nouveauxDroits);
      await depotDonnees.sauvegardeAutorisation(ciblee);

      reponse.json(objetGetAutorisation.donnees(ciblee));
    }
  );

  routes.get(
    '/:id/completude',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    middleware.aseptise('id'),
    (requete, reponse) => {
      const { service } = requete;
      const completude = service.completudeMesures();
      const pourcentageProgression = Math.round(
        (completude.nombreMesuresCompletes / completude.nombreTotalMesures) *
          100
      );
      reponse.json({ completude: pourcentageProgression });
    }
  );

  routes.get(
    '/:id/indiceCyber',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    middleware.aseptise('id'),
    (requete, reponse) => {
      const { service } = requete;
      reponse.json(service.indiceCyber());
    }
  );

  routes.post(
    '/:id/retourUtilisateurMesure',
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    middleware.aseptise('id', 'idMesure', 'idRetour', 'commentaire'),
    async (requete, reponse) => {
      const { service, idUtilisateurCourant } = requete;
      const { idRetour, idMesure, commentaire } = requete.body;
      const retourUtilisateur =
        referentiel.retourUtilisateurMesureAvecId(idRetour);

      if (!retourUtilisateur) {
        reponse.status(424).send({
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de retour utilisateur est incorrect.",
        });
        return;
      }

      if (!referentiel.estIdentifiantMesureConnu(idMesure)) {
        reponse.status(424).send({
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de mesure est incorrect.",
        });
        return;
      }

      await adaptateurJournalMSS.consigneEvenement(
        new EvenementRetourUtilisateurMesure({
          idService: service.id,
          idUtilisateur: idUtilisateurCourant,
          idMesure,
          idRetour,
          commentaire,
        }).toJSON()
      );

      reponse.sendStatus(200);
    }
  );

  return routes;
};

module.exports = routesConnecteApiService;
