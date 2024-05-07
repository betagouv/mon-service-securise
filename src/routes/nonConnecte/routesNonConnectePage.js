const express = require('express');

const routesNonConnectePage = ({ referentiel }) => {
  const routes = express.Router();

  routes.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  routes.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  routes.get('/securite', (_requete, reponse) => {
    reponse.render('securite');
  });

  routes.get('/accessibilite', (_requete, reponse) => {
    reponse.render('accessibilite');
  });

  routes.get('/cgu', (_requete, reponse) => {
    reponse.render('cgu');
  });

  routes.get('/confidentialite', (_requete, reponse) => {
    reponse.render('confidentialite');
  });

  routes.get('/mentionsLegales', (_requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  routes.get('/statistiques', (_requete, reponse) => {
    reponse.render('statistiques');
  });

  routes.get('/inscription', (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('inscription', { departements });
  });

  routes.get('/activation', (_requete, reponse) => {
    reponse.render('activation');
  });

  return routes;
};

module.exports = routesNonConnectePage;
