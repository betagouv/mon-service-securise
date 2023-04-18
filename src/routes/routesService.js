const express = require('express');

const ActionsSaisie = require('../modeles/actionsSaisie');
const Homologation = require('../modeles/homologation');
const InformationsHomologation = require('../modeles/informationsHomologation');

const routesService = (
  middleware,
  referentiel,
  depotDonnees,
  moteurRegles,
) => {
  const routes = express.Router();

  routes.get('/creation', middleware.verificationAcceptationCGU, (requete, reponse, suite) => {
    const { idUtilisateurCourant } = requete;
    depotDonnees.utilisateur(idUtilisateurCourant)
      .then((utilisateur) => {
        const donneesService = {};
        if (utilisateur.nomEntitePublique) {
          donneesService.descriptionService = {
            organisationsResponsables: [utilisateur.nomEntitePublique],
          };
        }

        const service = new Homologation(donneesService);
        reponse.render('service/creation', { referentiel, service });
      })
      .catch(suite);
  });

  routes.get('/:id', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;

    const actionsSaisie = new ActionsSaisie(referentiel, homologation)
      .toJSON()
      .map(({ id, ...autresDonnees }) => (
        { url: `/service/${homologation.id}/${id}`, id, ...autresDonnees }
      ));

    reponse.render('service/synthese', {
      InformationsHomologation,
      actionsSaisie,
      referentiel,
      service: homologation,
    });
  });

  routes.get('/:id/decision',
    middleware.trouveService,
    middleware.positionneHeadersAvecNonce,
    (requete, reponse) => {
      const { homologation, nonce } = requete;
      reponse.render('service/decision', { service: homologation, referentiel, nonce });
    });

  routes.get('/:id/descriptionService', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('service/descriptionService', { referentiel, service: homologation });
  });

  routes.get('/:id/mesures', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;
    const mesures = moteurRegles.mesures(homologation.descriptionService);
    reponse.render('service/mesures', { referentiel, service: homologation, mesures });
  });

  routes.get('/:id/rolesResponsabilites', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('service/rolesResponsabilites', { service: homologation });
  });

  routes.get('/:id/risques', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('service/risques', { referentiel, service: homologation });
  });

  routes.get('/:id/avisExpertCyber', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('service/avisExpertCyber', { referentiel, service: homologation });
  });

  routes.get('/:id/dossiers', middleware.trouveService, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('service/dossiers', {
      service: homologation,
      premiereEtapeParcours: referentiel.premiereEtapeParcours(),
      referentiel,
    });
  });

  routes.get('/:id/homologation/edition/etape/:idEtape', middleware.trouveService, (requete, reponse, suite) => {
    const { homologation } = requete;
    const { idEtape } = requete.params;

    if (!referentiel.etapeExiste(idEtape)) {
      reponse.status(404).send('Étape inconnue');
    } else {
      depotDonnees.ajouteDossierCourantSiNecessaire(homologation.id)
        .then(() => depotDonnees.homologation(homologation.id))
        .then((h) => reponse.render(`service/etapeDossier/${idEtape}`, { referentiel, service: h, idEtape }))
        .catch(suite);
    }
  });

  return routes;
};

module.exports = routesService;
