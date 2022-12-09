const express = require('express');

const { EchecAutorisation, ErreurModele } = require('../erreurs');
const ActeursHomologation = require('../modeles/acteursHomologation');
const AvisExpertCyber = require('../modeles/avisExpertCyber');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
const FonctionnalitesSpecifiques = require('../modeles/fonctionnalitesSpecifiques');
const DonneesSensiblesSpecifiques = require('../modeles/donneesSensiblesSpecifiques');
const MesureGenerale = require('../modeles/mesureGenerale');
const MesuresSpecifiques = require('../modeles/mesuresSpecifiques');
const PartiesPrenantes = require('../modeles/partiesPrenantes/partiesPrenantes');
const PointsAcces = require('../modeles/pointsAcces');
const RisqueGeneral = require('../modeles/risqueGeneral');
const RisquesSpecifiques = require('../modeles/risquesSpecifiques');
const RolesResponsabilites = require('../modeles/rolesResponsabilites');

const routesApiHomologation = (middleware, depotDonnees, referentiel) => {
  const routes = express.Router();

  routes.post('/', middleware.verificationAcceptationCGU, middleware.aseptise('nomService'), middleware.aseptiseListes([
    { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
    { nom: 'fonctionnalitesSpecifiques', proprietes: FonctionnalitesSpecifiques.proprietesItem() },
    { nom: 'donneesSensiblesSpecifiques', proprietes: DonneesSensiblesSpecifiques.proprietesItem() },
  ]),
  (requete, reponse, suite) => {
    const {
      nomService,
      typeService,
      provenanceService,
      fonctionnalites,
      fonctionnalitesSpecifiques,
      donneesCaracterePersonnel,
      donneesSensiblesSpecifiques,
      delaiAvantImpactCritique,
      localisationDonnees,
      presentation,
      pointsAcces,
      risqueJuridiqueFinancierReputationnel,
      statutDeploiement,
    } = requete.body;

    depotDonnees.nouvelleHomologation(requete.idUtilisateurCourant, {
      nomService,
      typeService,
      provenanceService,
      fonctionnalites,
      fonctionnalitesSpecifiques,
      donneesCaracterePersonnel,
      donneesSensiblesSpecifiques,
      delaiAvantImpactCritique,
      localisationDonnees,
      presentation,
      pointsAcces,
      risqueJuridiqueFinancierReputationnel,
      statutDeploiement,
    })
      .then((idHomologation) => reponse.json({ idHomologation }))
      .catch((e) => {
        if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
      });
  });

  routes.put('/:id', middleware.trouveHomologation, middleware.aseptise('nomService'), middleware.aseptiseListes([
    { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
    { nom: 'fonctionnalitesSpecifiques', proprietes: FonctionnalitesSpecifiques.proprietesItem() },
    { nom: 'donneesSensiblesSpecifiques', proprietes: DonneesSensiblesSpecifiques.proprietesItem() },
  ]),
  (requete, reponse, suite) => {
    const descriptionService = new DescriptionService(requete.body, referentiel);
    depotDonnees.ajouteDescriptionServiceAHomologation(
      requete.idUtilisateurCourant,
      requete.params.id,
      descriptionService
    )
      .then(() => reponse.send({ idHomologation: requete.homologation.id }))
      .catch((e) => {
        if (e instanceof ErreurModele) {
          reponse.status(422).send(e.message);
        } else suite(e);
      });
  });

  routes.post('/:id/mesures', middleware.trouveHomologation, middleware.aseptise(
    'mesuresGenerales.*.statut',
    'mesuresGenerales.*.modalites',
    'mesuresSpecifiques.*.description',
    'mesuresSpecifiques.*.categorie',
    'mesuresSpecifiques.*.statut',
    'mesuresSpecifiques.*.modalites',
  ),
  (requete, reponse, suite) => {
    const { mesuresSpecifiques = [], mesuresGenerales = {} } = requete.body;

    const idHomologation = requete.homologation.id;
    try {
      const ajouts = Object.keys(mesuresGenerales).reduce((acc, im) => {
        const mesure = new MesureGenerale({
          id: im,
          statut: mesuresGenerales[im].statut,
          modalites: mesuresGenerales[im].modalites,
        }, referentiel);

        return acc.then(
          () => depotDonnees.ajouteMesureGeneraleAHomologation(idHomologation, mesure)
        );
      }, Promise.resolve());

      ajouts
        .then(() => {
          const aPersister = mesuresSpecifiques.filter(
            (m) => m?.description || m?.categorie || m?.statut || m?.modalites
          );

          const listeMesures = new MesuresSpecifiques({
            mesuresSpecifiques: aPersister,
          }, referentiel);
          return depotDonnees.remplaceMesuresSpecifiquesPourHomologation(
            idHomologation,
            listeMesures,
          );
        })
        .then(() => reponse.send({ idHomologation }))
        .catch(suite);
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  routes.post('/:id/rolesResponsabilites',
    middleware.trouveHomologation,
    middleware.aseptiseListes([
      { nom: 'acteursHomologation', proprietes: ActeursHomologation.proprietesItem() },
      { nom: 'partiesPrenantes', proprietes: PartiesPrenantes.proprietesItem() },
    ]),
    (requete, reponse) => {
      const rolesResponsabilites = new RolesResponsabilites(requete.body);
      const idHomologation = requete.homologation.id;
      depotDonnees.ajouteRolesResponsabilitesAHomologation(
        idHomologation, rolesResponsabilites
      ).then(() => reponse.send({ idHomologation }));
    });

  routes.post('/:id/risques', middleware.trouveHomologation, middleware.aseptise(
    '*',
    'risquesSpecifiques.*.description',
    'risquesSpecifiques.*.niveauGravite',
    'risquesSpecifiques.*.commentaire',
  ),
  (requete, reponse, suite) => {
    const { risquesSpecifiques = [], ...params } = requete.body;
    const prefixeAttributRisque = /^(commentaire|niveauGravite)-/;
    const idHomologation = requete.homologation.id;

    try {
      const donneesRisques = Object.keys(params)
        .filter((p) => p.match(prefixeAttributRisque))
        .reduce((acc, p) => {
          const idRisque = p.replace(prefixeAttributRisque, '');
          const nomAttribut = p.match(prefixeAttributRisque)[1];
          acc[idRisque] ||= {};
          Object.assign(acc[idRisque], { id: idRisque, [nomAttribut]: params[p] });
          return acc;
        }, {});

      const ajouts = Object.values(donneesRisques)
        .reduce((acc, donnees) => {
          const risque = new RisqueGeneral(donnees, referentiel);
          return acc.then(() => depotDonnees.ajouteRisqueGeneralAHomologation(
            idHomologation,
            risque,
          ));
        }, Promise.resolve());

      ajouts
        .then(() => {
          const aPersister = risquesSpecifiques
            .filter((r) => r?.description || r?.commentaire || r?.niveauGravite);
          const listeRisquesSpecifiques = new RisquesSpecifiques({
            risquesSpecifiques: aPersister,
          }, referentiel);

          return depotDonnees.remplaceRisquesSpecifiquesPourHomologation(
            idHomologation, listeRisquesSpecifiques,
          );
        })
        .then(() => reponse.send({ idHomologation }))
        .catch(suite);
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  routes.post('/:id/avisExpertCyber', middleware.trouveHomologation, (requete, reponse) => {
    try {
      const avisExpert = new AvisExpertCyber(requete.body, referentiel);
      depotDonnees.ajouteAvisExpertCyberAHomologation(requete.params.id, avisExpert)
        .then(() => reponse.send({ idHomologation: requete.params.id }));
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  routes.put(
    '/:id/dossier',
    middleware.aseptise('dateHomologation', 'dureeValidite'),
    middleware.trouveHomologation,
    (requete, reponse, suite) => {
      const idHomologation = requete.homologation.id;
      const { dateHomologation, dureeValidite } = requete.body;

      if (!dateHomologation?.match(/^\d{4}-\d{2}-\d{2}$/)) {
        reponse.status(422).send("Date d'homologation manquante");
      } else if (!dureeValidite) {
        reponse.status(422).send('Durée de validité manquante');
      } else {
        const dossier = new Dossier({ dateHomologation, dureeValidite }, referentiel);
        depotDonnees.metsAJourDossierCourant(idHomologation, dossier)
          .then(() => reponse.send({ idHomologation }))
          .catch(suite);
      }
    }
  );

  routes.delete('/:id/autorisationContributeur',
    middleware.verificationAcceptationCGU,
    (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete;
      const idHomologation = requete.params.id;
      const { idContributeur } = requete.body;

      const verifiePermissionSuppressionContributeur = (...params) => depotDonnees
        .autorisationPour(...params)
        .then((a) => (
          a?.permissionSuppressionContributeur
            ? Promise.resolve()
            : Promise.reject(new EchecAutorisation())
        ));

      verifiePermissionSuppressionContributeur(idUtilisateurCourant, idHomologation)
        .then(() => depotDonnees.supprimeContributeur(idContributeur, idHomologation))
        .then(() => reponse.send(`Contributeur "${idContributeur}" supprimé pour l'homologation "${idHomologation}"`))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse.status(403).send(`Droits insuffisants pour supprimer un collaborateur de l'homologation "${idHomologation}"`);
          } else if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else {
            suite(e);
          }
        });
    });

  return routes;
};

module.exports = routesApiHomologation;
