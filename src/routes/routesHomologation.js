const express = require('express');

const ActionsSaisie = require('../modeles/actionsSaisie');
const Homologation = require('../modeles/homologation');
const InformationsHomologation = require('../modeles/informationsHomologation');

const routesHomologation = (middleware, referentiel, moteurRegles, adaptateurEnvironnement) => {
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
        { url: `/homologation/${homologation.id}/${id}`, id, ...autresDonnees }
      ));

    const avecAccesEtapier = adaptateurEnvironnement.avecAccesEtapier();

    reponse.render('homologation/synthese', {
      InformationsHomologation,
      actionsSaisie,
      avecAccesEtapier,
      referentiel,
      service: homologation,
    });
  });

  routes.get('/:id/decision',
    middleware.trouveHomologation,
    middleware.positionneHeadersAvecNonce,
    (requete, reponse) => {
      const { homologation, nonce } = requete;
      reponse.render('homologation/decision', { homologation, referentiel, nonce });
    });

  routes.get('/:id/syntheseSecurite',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/syntheseSecurite', { homologation, referentiel });
    });

  routes.get('/:id/syntheseSecurite/annexes/mesures',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/annexes/mesures', { homologation, referentiel });
    });

  routes.get('/:id/descriptionService', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/descriptionService', { referentiel, homologation });
  });

  routes.get('/:id/mesures', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    const mesures = moteurRegles.mesures(homologation.descriptionService);
    reponse.render('homologation/mesures', { referentiel, homologation, mesures });
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

  routes.get('/:id/dossiers', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/dossiers', { homologation });
  });

  routes.get('/:id/dossier/nouveau', middleware.trouveHomologation, (requete, reponse) => {
    reponse.redirect(`/homologation/${requete.params.id}/dossier/edition/etape/1`);
  });

  routes.get('/:id/dossier/edition/etape/:idEtape', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    const idEtape = parseInt(requete.params.idEtape, 10);
    if (![1, 2, 3].includes(idEtape)) {
      reponse.status(404).send('Étape inconnue');
    } else {
      reponse.render(`homologation/etapeDossier/${idEtape}`, { homologation, idEtape });
    }
  });

  return routes;
};

module.exports = routesHomologation;
