import express from 'express';

const routesConnecteOidc = ({ adaptateurOidc }) => {
  const routes = express.Router();

  routes.get('/deconnexion', async (requete, reponse) => {
    if (!requete.session?.AgentConnectIdToken) {
      return reponse.redirect('/connexion');
    }

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

    return reponse.redirect(url);
  });
  return routes;
};

export default routesConnecteOidc;
