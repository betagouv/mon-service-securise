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
  serviceGestionnaireSession,
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
      const profilProConnect = { nom, prenom, email, siret };
      let utilisateurExistant = await depotDonnees.utilisateurAvecEmail(email);

      if (!utilisateurExistant) {
        const token = adaptateurJWT.signeDonnees(profilProConnect);
        reponse.redirect(`/creation-compte?token=${token}`);
        return;
      }

      requete.session.AgentConnectIdToken = idToken;
      serviceGestionnaireSession.enregistreSession(
        requete,
        utilisateurExistant,
        SourceAuthentification.AGENT_CONNECT
      );

      if (!utilisateurExistant.aLesInformationsAgentConnect()) {
        // On considère que ProConnect a les données "les plus à jour", donc on maj MSS (et donc MPA)
        await depotDonnees.metsAJourUtilisateur(utilisateurExistant.id, {
          nom,
          prenom,
          entite: { siret },
        });
      } else {
        // La copie locale de MSS contient des données, mais peut être obsolète. On demande donc un rafraichissement à MPA
        await depotDonnees.rafraichisProfilUtilisateurLocal(
          utilisateurExistant.id
        );
      }

      await depotDonnees.enregistreNouvelleConnexionUtilisateur(
        utilisateurExistant.id,
        SourceAuthentification.AGENT_CONNECT
      );

      utilisateurExistant = await depotDonnees.utilisateur(
        utilisateurExistant.id
      );
      const profilAJour = {
        nom: utilisateurExistant.nom,
        prenom: utilisateurExistant.prenom,
        siret: utilisateurExistant.entite.siret,
        email: utilisateurExistant.email,
      };
      const tokenDonneesInvite = utilisateurExistant.estUnInvite()
        ? adaptateurJWT.signeDonnees({ ...profilAJour, invite: true })
        : undefined;

      reponse.render('apresAuthentification', {
        ...(urlRedirection && {
          urlRedirection:
            adaptateurEnvironnement.mss().urlBase() + urlRedirection,
        }),
        tokenDonneesInvite,
      });
    } catch (e) {
      console.warn(e);
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
