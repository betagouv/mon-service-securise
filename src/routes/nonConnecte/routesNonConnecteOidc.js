const express = require('express');

const routesNonConnecteOidc = ({ adaptateurOidc }) => {
  const routes = express.Router();

  routes.get('/connexion', async (requete, reponse, suite) => {
    try {
      const { url, state, nonce } =
        await adaptateurOidc.genereDemandeAutorisation();
      requete.session.state = state;
      requete.session.nonce = nonce;
      reponse.redirect(url);
    } catch (e) {
      suite(e);
    }
  });

  return routes;
};

module.exports = routesNonConnecteOidc;
