import express from 'express';

const routesConnecteApiVisiteGuidee = ({ depotDonnees }) => {
  const routes = express.Router();

  routes.post('/termine', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.finalise();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  return routes;
};

export default routesConnecteApiVisiteGuidee;
