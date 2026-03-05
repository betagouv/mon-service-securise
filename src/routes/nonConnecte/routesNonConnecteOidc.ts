import express, { Request } from 'express';
import { z } from 'zod';
import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
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
import { cookieProConnect } from '../../oidc/cookies.js';
import { ServiceForceMFA } from '../../oidc/serviceForceMFA.js';
import { estUrlLegalePourRedirection } from '../../http/redirection.js';

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
          await adaptateurOidc.genereDemandeAutorisation.sansForcerLeMFA();

        const { urlRedirection } = requete.query;
        cookieProConnect.deposePourConnexion(
          reponse,
          urlRedirection as string | undefined,
          state,
          nonce
        );
        reponse.redirect(url);
      } catch (e) {
        suite(e);
      }
    }
  );

  routes.get('/apres-authentification', async (requete, reponse) => {
    if (!cookieProConnect.existe(requete)) {
      reponse.status(401).send("Erreur d'authentification");
      return;
    }
    try {
      const { idToken, accessToken, connexionAvecMFA, acr } =
        await adaptateurOidc.recupereJeton(requete);

      const { urlRedirection } = cookieProConnect.recupere(requete);
      cookieProConnect.supprime(reponse);

      const { nom, prenom, email, siret, idFournisseurIdentite } =
        await adaptateurOidc.recupereInformationsUtilisateur(accessToken);

      const forceMFA = new ServiceForceMFA({
        fournisseursAvecMFA: adaptateurEnvironnement
          .oidc()
          .fournisseursAvecMFA(),
        generationUrlProConnectMFA:
          adaptateurOidc.genereDemandeAutorisation.quiForceLeMFA,
      });

      const politiqueMFA = await forceMFA.execute({
        idFournisseurIdentite,
        email,
        acr,
      });

      if (politiqueMFA.action === 'REDIRIGE_VERS_PROCONNECT') {
        const urlValide =
          urlRedirection && estUrlLegalePourRedirection(urlRedirection);
        cookieProConnect.deposePourConnexion(
          reponse,
          urlValide ? urlRedirection : undefined,
          politiqueMFA.state,
          politiqueMFA.nonce
        );
        reponse.redirect(politiqueMFA.url);
        return;
      }

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

    cookieProConnect.deposePourDeconnexion(reponse, state);

    return reponse.redirect(url);
  });

  routes.get(
    '/apres-deconnexion',
    valideQuery(z.strictObject({ state: z.string().min(1).max(100) })),
    async (requete, reponse) => {
      const { state } = cookieProConnect.recupere(requete as Request);
      if (state !== requete.query.state) {
        reponse.sendStatus(401);
        return;
      }
      cookieProConnect.supprime(reponse);
      reponse.redirect('/connexion');
    }
  );

  return routes;
};

export default routesNonConnecteOidc;
