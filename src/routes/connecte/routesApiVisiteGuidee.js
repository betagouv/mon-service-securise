const express = require('express');

const routesApiVisiteGuidee = ({ middleware, depotDonnees, referentiel }) => {
  const routes = express.Router();

  routes.post(
    '/:idEtape/termine',
    middleware.aseptise('idEtape'),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete;
      const { idEtape } = requete.params;

      if (!referentiel.etapeVisiteGuideeExiste(idEtape)) {
        reponse.status(400).send("Identifiant d'étape inconnu");
        return;
      }

      const parcoursUtilisateur =
        await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);

      parcoursUtilisateur.etatVisiteGuidee.termineEtape(idEtape);
      await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

      const idEtapeSuivante = referentiel.etapeSuivanteVisiteGuidee(idEtape);
      const urlEtapeSuivante =
        referentiel.etapeVisiteGuidee(idEtapeSuivante)?.urlEtape ?? null;

      reponse.send({ urlEtapeSuivante });
    }
  );

  routes.post('/termine', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.finalise();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  routes.post('/metsEnPause', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.metsEnPause();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  routes.post('/reprends', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.reprends();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  routes.post('/reinitialise', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.reinitialise();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  return routes;
};

module.exports = routesApiVisiteGuidee;
