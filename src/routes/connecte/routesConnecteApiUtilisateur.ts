import express from 'express';
import { z } from 'zod';
import { valideBody } from '../../http/validePayloads.js';
import {
  schemaPatchMotDePasse,
  schemaPutMotDePasse,
  schemaPutUtilisateur,
} from './routesConnecteApi.schema.js';
import { SourceAuthentification } from '../../modeles/sourceAuthentification.js';
import { obtentionDonneesDeBaseUtilisateur } from '../mappeur/utilisateur.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import {
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../../session/serviceGestionnaireSession.js';
import { RequeteMSS } from '../../http/middleware.js';
import {
  resultatValidation,
  valideMotDePasse,
} from '../../http/validationMotDePasse.js';
import { AdaptateurMail } from '../../adaptateurs/adaptateurMail.interface.js';
import Utilisateur from '../../modeles/utilisateur.js';
import { Middleware } from '../../http/middleware.interface.js';
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
  middleware,
  serviceCgu,
  serviceGestionnaireSession,
}: {
  adaptateurJWT: AdaptateurJWT;
  adaptateurMail: AdaptateurMail;
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  serviceCgu: ServiceCgu;
  serviceGestionnaireSession: ServiceGestionnaireSession;
}) => {
  const routes = express.Router();

  routes.put(
    '/motDePasse',
    valideBody(z.strictObject(schemaPutMotDePasse())),
    async (requete, reponse, suite) => {
      const {
        idUtilisateurCourant: idUtilisateur,
        cguAcceptees: cguDejaAcceptees,
      } = requete as RequeteMSS;

      const {
        motDePasse,
        infolettreAcceptee,
        cguAcceptees: cguEnCoursDAcceptation,
      } = requete.body;

      if (!cguDejaAcceptees && !cguEnCoursDAcceptation) {
        reponse.status(422).send('CGU non acceptées');
        return;
      }

      if (
        valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE
      ) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      try {
        let u = await depotDonnees.utilisateur(idUtilisateur);
        await depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);

        u = (await depotDonnees.valideAcceptationCGUPourUtilisateur(
          u
        )) as Utilisateur;

        await depotDonnees.supprimeIdResetMotDePassePourUtilisateur(u);
        await adaptateurMail.inscrisEmailsTransactionnels(u.email);

        if (infolettreAcceptee) {
          await adaptateurMail.inscrisInfolettre(u.email);
          await depotDonnees.metsAJourUtilisateur(u.id, {
            infolettreAcceptee: true,
          });
        }

        serviceGestionnaireSession.enregistreSession(
          requete as RequeteAvecSession,
          u,
          SourceAuthentification.MSS
        );

        reponse.json({ idUtilisateur });
      } catch (e) {
        suite(e);
      }
    }
  );

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

  routes.patch(
    '/motDePasse',
    valideBody(z.strictObject(schemaPatchMotDePasse())),
    middleware.challengeMotDePasse,
    async (requete, reponse) => {
      const { idUtilisateurCourant: idUtilisateur } = requete as RequeteMSS;

      const { motDePasse } = requete.body;

      const mdpInvalide =
        valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE;

      if (mdpInvalide) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      await depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);
      reponse.json({ idUtilisateur });
    }
  );

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

  routes.get('/utilisateurCourant', (requete, reponse) => {
    const { idUtilisateurCourant: idUtilisateur, sourceAuthentification } =
      requete as RequeteMSS;

    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) => {
        reponse.json({
          sourceAuthentification,
          utilisateur: {
            prenomNom: utilisateur!.prenomNom(),
          },
        });
      });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  return routes;
};
