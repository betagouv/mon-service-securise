const express = require('express');

const { EchecAutorisation, ErreurModele } = require('../erreurs');
const ActeursHomologation = require('../modeles/acteursHomologation');
const AvisExpertCyber = require('../modeles/avisExpertCyber');
const DescriptionService = require('../modeles/descriptionService');
const Dossier = require('../modeles/dossier');
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

const routesApiService = (middleware, depotDonnees, referentiel) => {
  const routes = express.Router();

  routes.post('/', middleware.verificationAcceptationCGU, middleware.aseptise('nomService'), middleware.aseptiseListes([
    { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
    { nom: 'fonctionnalitesSpecifiques', proprietes: FonctionnalitesSpecifiques.proprietesItem() },
    { nom: 'donneesSensiblesSpecifiques', proprietes: DonneesSensiblesSpecifiques.proprietesItem() },
  ]), (requete, reponse, suite) => {
    Promise.resolve()
      .then(() => new DescriptionService(requete.body, referentiel))
      .then((description) => depotDonnees.nouvelleHomologation(
        requete.idUtilisateurCourant,
        description.toJSON(),
      ))
      .then((idService) => reponse.json({ idService }))
      .catch((e) => {
        if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
      });
  });

  routes.put('/:id', middleware.trouveHomologation, middleware.aseptise('nomService'), middleware.aseptiseListes([
    { nom: 'pointsAcces', proprietes: PointsAcces.proprietesItem() },
    { nom: 'fonctionnalitesSpecifiques', proprietes: FonctionnalitesSpecifiques.proprietesItem() },
    { nom: 'donneesSensiblesSpecifiques', proprietes: DonneesSensiblesSpecifiques.proprietesItem() },
  ]), (requete, reponse, suite) => {
    Promise.resolve()
      .then(() => new DescriptionService(requete.body, referentiel))
      .then((descriptionService) => depotDonnees.ajouteDescriptionServiceAHomologation(
        requete.idUtilisateurCourant,
        requete.params.id,
        descriptionService,
      ))
      .then(() => reponse.send({ idService: requete.homologation.id }))
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
  ), (requete, reponse, suite) => {
    const { mesuresSpecifiques = [], mesuresGenerales = {} } = requete.body;
    const idService = requete.homologation.id;

    try {
      const generales = Object.keys(mesuresGenerales)
        .map((idMesure) => {
          const { modalites, statut } = mesuresGenerales[idMesure];
          return new MesureGenerale({ id: idMesure, statut, modalites }, referentiel);
        });

      const aPersister = mesuresSpecifiques
        .filter((mesure) => MesureSpecifique.proprietesObligatoiresRenseignees(mesure));
      const specifiques = new MesuresSpecifiques(
        { mesuresSpecifiques: aPersister },
        referentiel,
      );

      depotDonnees.ajouteMesuresAHomologation(idService, generales, specifiques)
        .then(() => reponse.send({ idService }))
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
      const idService = requete.homologation.id;
      depotDonnees.ajouteRolesResponsabilitesAHomologation(
        idService, rolesResponsabilites
      ).then(() => reponse.send({ idService }));
    });

  routes.post('/:id/risques', middleware.trouveHomologation, middleware.aseptise(
    '*',
    'risquesSpecifiques.*.description',
    'risquesSpecifiques.*.niveauGravite',
    'risquesSpecifiques.*.commentaire',
  ), (requete, reponse, suite) => {
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
          Object.assign(acc[idRisque], { id: idRisque, [nomAttribut]: params[p] });
          return acc;
        }, {});

      const ajouts = Object.values(donneesRisques)
        .reduce((acc, donnees) => {
          const risque = new RisqueGeneral(donnees, referentiel);
          return acc.then(() => depotDonnees.ajouteRisqueGeneralAHomologation(idService, risque));
        }, Promise.resolve());

      ajouts
        .then(() => {
          const aPersister = risquesSpecifiques
            .filter((r) => r?.description || r?.commentaire || r?.niveauGravite);
          const listeRisquesSpecifiques = new RisquesSpecifiques({
            risquesSpecifiques: aPersister,
          }, referentiel);

          return depotDonnees.remplaceRisquesSpecifiquesPourHomologation(
            idService, listeRisquesSpecifiques,
          );
        })
        .then(() => reponse.send({ idService }))
        .catch(suite);
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  routes.post('/:id/avisExpertCyber', middleware.trouveHomologation, (requete, reponse) => {
    try {
      const avisExpert = new AvisExpertCyber(requete.body, referentiel);
      depotDonnees.ajouteAvisExpertCyberAHomologation(requete.params.id, avisExpert)
        .then(() => reponse.send({ idService: requete.params.id }));
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  routes.put(
    '/:id/dossier',
    middleware.aseptise('dateHomologation', 'dureeValidite'),
    middleware.trouveHomologation,
    (requete, reponse, suite) => {
      const idService = requete.homologation.id;
      const { dateHomologation, dureeValidite, finalise = false } = requete.body;

      const seulementDonneesRecues = () => {
        const donneesDossier = { finalise };

        if (dateHomologation) {
          donneesDossier.dateHomologation = dateHomologation;
        }
        if (dureeValidite) {
          donneesDossier.dureeValidite = dureeValidite;
        }

        return donneesDossier;
      };

      if (!finalise && dateInvalide(dateHomologation)) {
        reponse.status(422).send("Date d'homologation manquante");
      } else if (!finalise && !dureeValidite) {
        reponse.status(422).send('Durée de validité manquante');
      } else {
        const dossier = new Dossier(seulementDonneesRecues(), referentiel);
        depotDonnees.metsAJourDossierCourant(idService, dossier)
          .then(() => reponse.send({ idService }))
          .catch(suite);
      }
    }
  );

  routes.delete('/:id/autorisationContributeur',
    middleware.verificationAcceptationCGU,
    (requete, reponse, suite) => {
      const { idUtilisateurCourant } = requete;
      const idService = requete.params.id;
      const { idContributeur } = requete.body;

      const verifiePermissionSuppressionContributeur = (...params) => depotDonnees
        .autorisationPour(...params)
        .then((a) => (
          a?.permissionSuppressionContributeur
            ? Promise.resolve()
            : Promise.reject(new EchecAutorisation())
        ));

      verifiePermissionSuppressionContributeur(idUtilisateurCourant, idService)
        .then(() => depotDonnees.supprimeContributeur(idContributeur, idService))
        .then(() => reponse.send(`Contributeur "${idContributeur}" supprimé pour l'homologation "${idService}"`))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse.status(403).send(`Droits insuffisants pour supprimer un collaborateur du service "${idService}"`);
          } else if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else {
            suite(e);
          }
        });
    });

  routes.delete('/:id', middleware.verificationAcceptationCGU, (requete, reponse) => {
    const verifiePermissionSuppressionService = (idUtilisateur, idService) => depotDonnees
      .autorisationPour(idUtilisateur, idService)
      .then((autorisation) => (
        autorisation?.permissionSuppressionService
          ? Promise.resolve()
          : Promise.reject(new EchecAutorisation())
      ));

    const { idUtilisateurCourant } = requete;
    const idService = requete.params.id;

    verifiePermissionSuppressionService(idUtilisateurCourant, idService)
      .then(() => depotDonnees.supprimeHomologation(idService))
      .then(() => reponse.send('Service supprimé'))
      .catch((e) => {
        if (e instanceof EchecAutorisation) {
          reponse.status(403).send('Droits insuffisants pour supprimer le service');
        } else {
          suite(e);
        }
      });
  });

  return routes;
};

module.exports = routesApiService;
