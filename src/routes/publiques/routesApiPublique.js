const express = require('express');

const routesApiPublique = ({ middleware, referentiel }) => {
  const routes = express.Router();

  routes.get(
    '/nouvelleFonctionnalite/:id',
    middleware.aseptise('id'),
    (requete, reponse) => {
      const idNouvelleFonctionnalite = requete.params.id;
      const nouvelleFonctionnalite = referentiel.nouvelleFonctionnalite(
        idNouvelleFonctionnalite
      );

      if (!nouvelleFonctionnalite) {
        reponse.status(404).send('Nouvelle fonctionnalité inconnue');
        return;
      }

      reponse.render(
        `nouvellesFonctionnalites/${nouvelleFonctionnalite.fichierPug}`
      );
    }
  );

  return routes;
};

module.exports = routesApiPublique;
