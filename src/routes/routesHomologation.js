const express = require('express');

const ActionsSaisie = require('../modeles/actionsSaisie');
const Homologation = require('../modeles/homologation');
const InformationsHomologation = require('../modeles/informationsHomologation');

const routesHomologation = (middleware, referentiel) => {
  const routes = express.Router();

  routes.get('/creation', middleware.verificationAcceptationCGU, (_requete, reponse) => {
    const homologation = new Homologation({});
    reponse.render('homologation/creation', { referentiel, homologation });
  });

  routes.get('/:id', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    const actionsSaisie = new ActionsSaisie(referentiel, homologation)
      .toJSON()
      .map(({ id, ...autresDonnees }) => (
        { url: `/homologation/${homologation.id}/${id}`, ...autresDonnees }
      ));

    reponse.render('homologation', { homologation, actionsSaisie, InformationsHomologation });
  });

  routes.get('/:id/decision',
    middleware.trouveHomologation,
    middleware.positionneHeadersAvecNonce,
    (requete, reponse) => {
      const { homologation, nonce } = requete;
      reponse.render('homologation/decision', { homologation, referentiel, nonce });
    });

  routes.get('/:id/descriptionService', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/descriptionService', { referentiel, homologation });
  });

  routes.get('/:id/mesures', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/mesures', { referentiel, homologation });
  });

  routes.get('/:id/rolesResponsabilites', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/rolesResponsabilites', { homologation });
  });

  routes.get('/:id/risques', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/risques', { referentiel, homologation });
  });

  routes.get('/:id/avisExpertCyber', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/avisExpertCyber', { referentiel, homologation });
  });

  return routes;
};

module.exports = routesHomologation;
