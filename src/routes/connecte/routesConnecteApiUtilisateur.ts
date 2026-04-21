import express from 'express';
import { z } from 'zod';
import { valideBody } from '../../http/validePayloads.js';
import { schemaPutUtilisateur } from './routesConnecteApi.schema.js';
import { obtentionDonneesDeBaseUtilisateur } from '../mappeur/utilisateur.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import {
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../../session/serviceGestionnaireSession.js';
import { RequeteMSS } from '../../http/middleware.js';
import { AdaptateurMail } from '../../adaptateurs/adaptateurMail.interface.js';
import Utilisateur from '../../modeles/utilisateur.js';
import { ServiceCgu } from '../../serviceCgu.interface.js';
import { AdaptateurJWT } from '../../adaptateurs/adaptateurJWT.interface.js';
import {
  IdentiteFournieParProConnect,
  PartieModifiableProfilUtilisateur,
} from '../../modeles/utilisateur.types.js';
import { TokenMSSPourCreationUtilisateur } from '../../utilisateur/tokenMSSPourCreationUtilisateur.js';

export const routesConnecteApiUtilisateur = ({
  adaptateurJWT,
  adaptateurMail,
  depotDonnees,
  serviceCgu,
  serviceGestionnaireSession,
}: {
  adaptateurJWT: AdaptateurJWT;
  adaptateurMail: AdaptateurMail;
  depotDonnees: DepotDonnees;
  serviceCgu: ServiceCgu;
  serviceGestionnaireSession: ServiceGestionnaireSession;
}) => {
  const routes = express.Router();

  routes.put('/utilisateur/acceptationCGU', async (requete, reponse) => {
    const { idUtilisateurCourant: idUtilisateur, sourceAuthentification } =
      requete as RequeteMSS;

    let u = await depotDonnees.utilisateur(idUtilisateur);
    u = (await depotDonnees.valideAcceptationCGUPourUtilisateur(
      u
    )) as Utilisateur;

    serviceGestionnaireSession.enregistreSession(
      requete as RequeteAvecSession,
      u,
      sourceAuthentification!
    );

    reponse.sendStatus(200);
  });

  routes.put(
    '/utilisateur',
    valideBody(z.strictObject(schemaPutUtilisateur)),
    (requete, reponse, suite) => {
      const { idUtilisateurCourant: idUtilisateur } = requete as RequeteMSS;

      const donnees = obtentionDonneesDeBaseUtilisateur(
        requete.body,
        serviceCgu
      ) as PartieModifiableProfilUtilisateur & IdentiteFournieParProConnect;

      const { token } = requete.body;
      if (token) {
        try {
          const tokenMSS = new TokenMSSPourCreationUtilisateur(adaptateurJWT);
          const donneesToken = tokenMSS.lis(token);
          donnees.prenom = donneesToken.prenom;
          donnees.nom = donneesToken.nom;
        } catch {
          reponse.sendStatus(422);
          return;
        }
      }

      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          utilisateur!.changePreferencesCommunication(
            {
              infolettreAcceptee: donnees.infolettreAcceptee,
              transactionnelAccepte: donnees.transactionnelAccepte,
            },
            adaptateurMail
          )
        )
        .then(() => depotDonnees.metsAJourUtilisateur(idUtilisateur, donnees))
        .then(() => reponse.json({ idUtilisateur }))
        .catch(suite);
    }
  );

  return routes;
};
