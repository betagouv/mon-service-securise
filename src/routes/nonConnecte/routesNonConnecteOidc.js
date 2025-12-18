import express from 'express';
import { z } from 'zod';
import { estUrlLegalePourRedirection } from '../../http/redirection.js';
import { fabriqueAdaptateurGestionErreur } from '../../adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { serviceApresAuthentification } from '../../utilisateur/serviceApresAuthentification.js';
import { executeurApresAuthentification } from '../../utilisateur/executeurApresAuthentification.js';
import { valideQuery } from '../../http/validePayloads.js';

const routesNonConnecteOidc = ({
  adaptateurOidc,
  adaptateurJWT,
  depotDonnees,
  middleware,
  adaptateurEnvironnement,
  serviceGestionnaireSession,
  adaptateurProfilAnssi,
  serviceAnnuaire,
}) => {
  const routes = express.Router();

  routes.get(
    '/connexion',
    valideQuery(
      z.strictObject({ urlRedirection: z.string().max(1000).optional() })
    ),
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

      const ordre = await serviceApresAuthentification({
        adaptateurProfilAnssi,
        serviceAnnuaire,
        profilProConnect,
        depotDonnees,
      });

      await executeurApresAuthentification(ordre, {
        requete,
        reponse,
        agentConnectIdToken: idToken,
        adaptateurJWT,
        depotDonnees,
        urlRedirection,
        adaptateurEnvironnement,
        serviceGestionnaireSession,
      });
    } catch (e) {
      fabriqueAdaptateurGestionErreur().logueErreur(e);
      reponse.status(401).send("Erreur d'authentification");
    }
  });

  routes.get(
    '/apres-deconnexion',
    valideQuery(z.strictObject({ state: z.string().min(1).max(100) })),
    async (requete, reponse) => {
      const state = requete.cookies.AgentConnectInfo?.state;
      if (state !== requete.query.state) {
        reponse.sendStatus(401);
        return;
      }
      reponse.clearCookie('AgentConnectInfo');
      reponse.redirect('/connexion');
    }
  );

  return routes;
};

export default routesNonConnecteOidc;
