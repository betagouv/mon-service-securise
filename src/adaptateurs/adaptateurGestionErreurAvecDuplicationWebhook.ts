import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { AdaptateurGestionErreur } from './adaptateurGestionErreur.interface.js';
import { webhookLogErreur } from './adaptateurEnvironnement.js';

function loggueErreurSurWebhook(
  erreur: Error,
  infosDeContexte: Record<string, unknown> = {}
) {
  const contexte = Object.entries(infosDeContexte).map(
    ([cle, valeur]) => `${cle}: ${JSON.stringify(valeur)}`
  );
  axios
    .post(
      webhookLogErreur().url()!,
      { text: [...contexte, erreur.stack].join('\n') },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      }
    )
    .then();
}

export const fabriqueAdaptateurGestionErreurAvecDuplicationWebhook = (
  adaptateurErreur: AdaptateurGestionErreur
): AdaptateurGestionErreur => ({
  initialise: adaptateurErreur.initialise,
  identifieUtilisateur: adaptateurErreur.identifieUtilisateur,
  controleurErreurs: (
    erreur: Error,
    requete: Request,
    reponse: Response,
    suite: NextFunction
  ) => {
    loggueErreurSurWebhook(erreur, {
      // @ts-expect-error c'est nous qui ajoutons le champ idUtilisateurCourant à la requête
      idUtilisateurCourant: requete.idUtilisateurCourant,
      url: requete.url,
      body: requete.body,
    });
    adaptateurErreur.controleurErreurs(erreur, requete, reponse, suite);
  },
  logueErreur: (
    erreur: Error,
    infosDeContexte: Record<string, unknown> = {}
  ) => {
    loggueErreurSurWebhook(erreur, infosDeContexte);
    adaptateurErreur.logueErreur(erreur, infosDeContexte);
  },
});
