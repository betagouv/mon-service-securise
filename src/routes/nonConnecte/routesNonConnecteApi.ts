import express from 'express';
import * as z from 'zod';
import {
  EchecEnvoiMessage,
  ErreurModele,
  ErreurUtilisateurExistant,
} from '../../erreurs.js';
import { obtentionDonneesDeBaseUtilisateur } from '../mappeur/utilisateur.js';
import { SourceAuthentification } from '../../modeles/sourceAuthentification.js';
import { valideBody, valideQuery } from '../../http/validePayloads.js';
import {
  reglesValidationDesinscriptionInfolettre,
  reglesValidationRechercheOrganisations,
  reglesValidationReinitialisationMotDePasse,
  schemaPostUtilisateur,
} from './routesNonConnecteApi.schema.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { ServiceAnnuaire } from '../../annuaire/serviceAnnuaire.interface.js';
import { AdaptateurMail } from '../../adaptateurs/adaptateurMail.interface.js';
import { AdaptateurJWT } from '../../adaptateurs/adaptateurJWT.interface.js';
import { InscriptionUtilisateur } from '../../modeles/inscriptionUtilisateur.interface.js';
import { AdaptateurGestionErreur } from '../../adaptateurs/adaptateurGestionErreur.interface.js';
import { ServiceCgu } from '../../serviceCgu.interface.js';
import {
  IdentiteFournieParProConnect,
  PartieModifiableProfilUtilisateur,
} from '../../modeles/utilisateur.types.js';

import { TokenMSSPourCreationUtilisateur } from '../../utilisateur/tokenMSSPourCreationUtilisateur.js';

const routesNonConnecteApi = ({
  middleware,
  depotDonnees,
  serviceAnnuaire,
  adaptateurMail,
  adaptateurJWT,
  inscriptionUtilisateur,
  adaptateurGestionErreur,
  serviceCgu,
}: {
  middleware: Middleware;
  depotDonnees: DepotDonnees;
  serviceAnnuaire: ServiceAnnuaire;
  adaptateurMail: AdaptateurMail;
  adaptateurJWT: AdaptateurJWT;
  inscriptionUtilisateur: InscriptionUtilisateur;
  adaptateurGestionErreur: AdaptateurGestionErreur;
  serviceCgu: ServiceCgu;
}) => {
  const routes = express.Router();

  routes.post(
    '/utilisateur',
    middleware.protegeTrafic(),
    valideBody(z.strictObject(schemaPostUtilisateur)),
    async (requete, reponse, suite) => {
      const { token } = requete.body;

      const donnees = obtentionDonneesDeBaseUtilisateur(
        requete.body,
        serviceCgu
      ) as PartieModifiableProfilUtilisateur & IdentiteFournieParProConnect;

      try {
        const tokenMSS = new TokenMSSPourCreationUtilisateur(adaptateurJWT);
        const donneesToken = tokenMSS.lis(token);
        donnees.prenom = donneesToken.prenom;
        donnees.nom = donneesToken.nom;
        donnees.email = donneesToken.email?.toLowerCase();
      } catch {
        reponse.sendStatus(422);
        return;
      }

      try {
        const { agentConnect } = requete.body;

        const source = agentConnect
          ? SourceAuthentification.AGENT_CONNECT
          : SourceAuthentification.MSS;
        const utilisateur = await inscriptionUtilisateur.inscrisUtilisateur(
          donnees,
          source
        );

        reponse.json({ idUtilisateur: utilisateur.id });
      } catch (e) {
        if (e instanceof ErreurUtilisateurExistant) {
          await adaptateurMail.envoieNotificationTentativeReinscription(
            donnees.email
          );
          reponse.json({ idUtilisateur: e.idUtilisateur });
        } else if (e instanceof EchecEnvoiMessage) {
          reponse
            .status(424)
            .send("L'envoi de l'email de finalisation d'inscription a échoué");
        } else if (e instanceof ErreurModele) {
          reponse.status(422).send(e.message);
        } else suite(e);
      }
    }
  );

  routes.post(
    '/reinitialisationMotDePasse',
    middleware.protegeTrafic(),
    valideBody(z.strictObject(reglesValidationReinitialisationMotDePasse)),
    (requete, reponse, suite) => {
      const email = requete.body.email?.toLowerCase();

      depotDonnees
        .reinitialiseMotDePasse(email)
        .then((utilisateur) => {
          if (utilisateur) {
            adaptateurMail.envoieMessageReinitialisationMotDePasse(
              utilisateur.email,
              utilisateur.idResetMotDePasse
            );
          }
        })
        .then(() => reponse.send(''))
        .catch(suite);
    }
  );

  routes.get(
    '/annuaire/organisations',
    valideQuery(z.strictObject(reglesValidationRechercheOrganisations)),
    async (requete, reponse) => {
      const { recherche = '', departement = undefined } = requete.query;

      const suggestions = await serviceAnnuaire.rechercheOrganisations(
        recherche,
        departement
      );

      return reponse.status(200).json({ suggestions });
    }
  );

  routes.post(
    '/desinscriptionInfolettre',
    middleware.verificationAddresseIP(['185.107.232.1/24', '1.179.112.1/20']),
    valideBody(z.looseObject(reglesValidationDesinscriptionInfolettre)),
    async (requete, reponse) => {
      const { email } = requete.body;

      const utilisateur = await depotDonnees.utilisateurAvecEmail(email);
      if (!utilisateur) {
        reponse.status(424).json({ erreur: `L'email fourni est introuvable` });
        return;
      }

      await depotDonnees.metsAJourUtilisateur(utilisateur.id, {
        transactionnelAccepte: false,
      });
      reponse.sendStatus(200);
    }
  );

  routes.get(
    '/sante',
    middleware.protegeTrafic(),
    async (_requete, reponse) => {
      try {
        await depotDonnees.santeDuDepot();
        reponse.setHeader('Surrogate-Control', 'no-store');
        reponse.setHeader(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        reponse.setHeader('Expires', '0');
        reponse.sendStatus(200);
      } catch {
        adaptateurGestionErreur.logueErreur(
          new Error('La base de données est injoignable')
        );
        reponse.sendStatus(503);
      }
    }
  );

  return routes;
};

export default routesNonConnecteApi;
