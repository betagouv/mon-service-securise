import express from 'express';
import { z } from 'zod';
import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
import { estUrlLegalePourRedirection } from '../../http/redirection.js';
import { fabriqueAdaptateurGestionErreur } from '../../adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { serviceApresAuthentification } from '../../utilisateur/serviceApresAuthentification.js';
import { executeurApresAuthentification } from '../../utilisateur/executeurApresAuthentification.js';
import { valideQuery } from '../../http/validePayloads.js';
import { AdaptateurOidc } from '../../adaptateurs/adaptateurOidc.interface.js';
import { AdaptateurJWT } from '../../adaptateurs/adaptateurJWT.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import {
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../../session/serviceGestionnaireSession.js';
import { ServiceAnnuaire } from '../../annuaire/serviceAnnuaire.interface.js';

const routesNonConnecteOidc = ({
  adaptateurOidc,
  adaptateurJWT,
  depotDonnees,
  middleware,
  adaptateurEnvironnement,
  serviceGestionnaireSession,
  adaptateurProfilAnssi,
  serviceAnnuaire,
}: {
  adaptateurOidc: AdaptateurOidc;
  adaptateurJWT: AdaptateurJWT;
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  adaptateurEnvironnement: AdaptateurEnvironnement;
  serviceGestionnaireSession: ServiceGestionnaireSession;
  adaptateurProfilAnssi: AdaptateurProfilAnssi;
  serviceAnnuaire: ServiceAnnuaire;
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
            maxAge: 5 * 60_000,
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
      const { idToken, accessToken, connexionAvecMFA } =
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
        requete: requete as RequeteAvecSession,
        reponse,
        agentConnectIdToken: idToken,
        adaptateurJWT,
        depotDonnees,
        urlRedirection,
        adaptateurEnvironnement,
        serviceGestionnaireSession,
        connexionAvecMFA,
      });
    } catch (e) {
      fabriqueAdaptateurGestionErreur().logueErreur(e as Error);
      reponse.status(401).send("Erreur d'authentification");
    }
  });

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
