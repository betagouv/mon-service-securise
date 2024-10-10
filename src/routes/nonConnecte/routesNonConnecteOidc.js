const express = require('express');
const SourceAuthentification = require('../../modeles/sourceAuthentification');
const { estUrlLegalePourRedirection } = require('../../http/redirection');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../../adaptateurs/fabriqueAdaptateurGestionErreur');

const routesNonConnecteOidc = ({
  adaptateurOidc,
  adaptateurJWT,
  depotDonnees,
  middleware,
  adaptateurEnvironnement,
}) => {
  const routes = express.Router();

  routes.get(
    '/connexion',
    middleware.suppressionCookie,
    async (requete, reponse, suite) => {
      try {
        const { url, state, nonce } =
          await adaptateurOidc.genereDemandeAutorisation();

        const { urlRedirection } = requete.query;
        const urlValide =
          urlRedirection && estUrlLegalePourRedirection(urlRedirection);

        reponse.cookie(
          'AgentConnectInfo',
          { state, nonce, ...(urlValide && { urlRedirection }) },
          {
            maxAge: 120_000,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          }
        );
        reponse.redirect(url);
      } catch (e) {
        suite(e);
      }
    }
  );

  routes.get('/apres-authentification', async (requete, reponse) => {
    if (!requete.cookies.AgentConnectInfo) {
      reponse.status(401).send("Erreur d'authentification");
      return;
    }
    try {
      const { idToken, accessToken } =
        await adaptateurOidc.recupereJeton(requete);
      const { urlRedirection } = requete.cookies.AgentConnectInfo;

      reponse.clearCookie('AgentConnectInfo');

      const { nom, prenom, email, siret } =
        await adaptateurOidc.recupereInformationsUtilisateur(accessToken);
      const utilisateurExistant =
        await depotDonnees.utilisateurAvecEmail(email);

      if (utilisateurExistant && utilisateurExistant.cguAcceptees) {
        requete.session.AgentConnectIdToken = idToken;
        requete.session.token = utilisateurExistant.genereToken(
          SourceAuthentification.AGENT_CONNECT
        );
        if (!utilisateurExistant.aLesInformationsAgentConnect()) {
          await depotDonnees.metsAJourUtilisateur(utilisateurExistant.id, {
            nom,
            prenom,
            entite: { siret },
          });
        }
        await depotDonnees.enregistreNouvelleConnexionUtilisateur(
          utilisateurExistant.id,
          SourceAuthentification.AGENT_CONNECT
        );
        reponse.render('apresAuthentification', {
          ...(urlRedirection && {
            urlRedirection:
              adaptateurEnvironnement.mss().urlBase() + urlRedirection,
          }),
        });
      } else {
        const token = adaptateurJWT.signeDonnees({
          nom,
          prenom,
          email,
          siret,
        });
        reponse.redirect(`/creation-compte?token=${token}`);
      }
    } catch (e) {
      fabriqueAdaptateurGestionErreur().logueErreur(e);
      reponse.status(401).send("Erreur d'authentification");
    }
  });

  routes.get('/apres-deconnexion', async (requete, reponse) => {
    const { state } = requete.cookies.AgentConnectInfo;
    if (state !== requete.query.state) {
      reponse.sendStatus(401);
      return;
    }
    reponse.clearCookie('AgentConnectInfo');
    reponse.redirect('/connexion');
  });

  return routes;
};

module.exports = routesNonConnecteOidc;
