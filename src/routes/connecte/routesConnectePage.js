const express = require('express');

const routesConnectePage = ({ depotDonnees }) => {
  const routes = express.Router();

  routes.get('/motDePasse/edition', (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    depotDonnees.utilisateur(idUtilisateur).then((utilisateur) =>
      reponse.render('motDePasse/edition', {
        utilisateur,
        afficheChallengeMotDePasse: true,
      })
    );
  });

  return routes;
};

module.exports = routesConnectePage;
