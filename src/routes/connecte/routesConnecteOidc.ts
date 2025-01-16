const express = require('express');

const routesConnecteOidc = ({ adaptateurOidc, middleware }) => {
  const routes = express.Router();

  routes.get(
    '/deconnexion',
    middleware.verificationJWT,
    async (requete, reponse) => {
      const { url, state } = await adaptateurOidc.genereDemandeDeconnexion(
        requete.session.AgentConnectIdToken
      );

      reponse.cookie(
        'AgentConnectInfo',
        { state },
        {
          maxAge: 30_000,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        }
      );

      reponse.redirect(url);
    }
  );
  return routes;
};

module.exports = routesConnecteOidc;
