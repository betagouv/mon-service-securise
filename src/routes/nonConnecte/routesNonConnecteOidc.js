const express = require('express');
const SourceAuthentification = require('../../modeles/sourceAuthentification');

const routesNonConnecteOidc = ({ adaptateurOidc, depotDonnees }) => {
  const routes = express.Router();

  routes.get('/connexion', async (_requete, reponse, suite) => {
    try {
      const { url, state, nonce } =
        await adaptateurOidc.genereDemandeAutorisation();
      reponse.cookie(
        'AgentConnectInfo',
        { state, nonce },
        {
          maxAge: 30_000,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        }
      );
      reponse.redirect(url);
    } catch (e) {
      suite(e);
    }
  });

  routes.get('/apres-authentification', async (requete, reponse) => {
    try {
      const { idToken, accessToken } =
        await adaptateurOidc.recupereJeton(requete);

      reponse.clearCookie('AgentConnectInfo');

      const informationsUtilisateur =
        await adaptateurOidc.recupereInformationsUtilisateur(accessToken);

      const utilisateurExistant = await depotDonnees.utilisateurAvecEmail(
        informationsUtilisateur.email
      );

      if (utilisateurExistant) {
        requete.session.AgentConnectIdToken = idToken;
        requete.session.token = utilisateurExistant.genereToken(
          SourceAuthentification.AGENT_CONNECT
        );
        await depotDonnees.enregistreNouvelleConnexionUtilisateur(
          utilisateurExistant.id,
          SourceAuthentification.AGENT_CONNECT
        );
        reponse.render('apresAuthentification');
      } else {
        const { nom, prenom, email, siret } = informationsUtilisateur;
        const params = new URLSearchParams({
          nom,
          prenom,
          email,
          siret: siret || '',
        });
        reponse.redirect(`/inscription?${params}&agentConnect`);
      }
    } catch (e) {
      reponse.status(401).send("Erreur d'authentification");
    }
  });

  return routes;
};

module.exports = routesNonConnecteOidc;
