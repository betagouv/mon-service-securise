import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { sentry } from './adaptateurEnvironnement.js';
import { UUID } from '../typesBasiques.js';

const logueErreur = (
  erreur: Error,
  infosDeContexte: Record<string, unknown> = {}
) => {
  Sentry.withScope(() => {
    Object.entries(infosDeContexte).forEach(([cle, valeur]) =>
      Sentry.setExtra(cle, valeur)
    );

    if (axios.isAxiosError(erreur)) {
      Sentry.captureException(erreur, {
        extra: {
          message: erreur.message,
          name: erreur.name,
          code: erreur.code,
          response: {
            status: erreur.response?.status,
            headers: erreur.response?.headers,
            data: erreur.response?.data,
          },
          request: {
            method: erreur.request?.method,
            body: erreur.request?.body,
            path: erreur.request?.path,
            protocol: erreur.request?.protocol,
          },
        },
      });
      return;
    }

    Sentry.captureException(erreur);
  });
};

type SourceMss = 'backend' | 'api-publique';

const initialise = (source: SourceMss) => {
  const config = sentry();

  Sentry.init({
    dsn: config.dsn(),
    environment: config.environnement(),
    ignoreTransactions: config.cheminsIgnoresParTracing(),
    tracesSampleRate: config.sampleRateDuTracing(),
    maxValueLength: 50_000,
  });
  Sentry.setTag('mss-source', source);
};

const controleurErreurs = (
  erreur: Error,
  requete: Request,
  reponse: Response,
  suite: NextFunction
) => {
  const estErreurCSRF = erreur.message === 'CSRF token mismatch';
  if (estErreurCSRF) {
    logueErreur(new Error('Une erreur CSRF mismatch a été détectée'), {
      'Token CSRF du client': requete.headers['x-csrf-token'],
    });
  }

  const idEvenement = Sentry.captureException(erreur);
  (reponse as Response & { sentry?: string }).sentry = idEvenement;
  suite(erreur);
};

const identifieUtilisateur = (
  idUtilisateur: UUID,
  timestampTokenJwt: number
) => {
  Sentry.setUser({
    id: idUtilisateur,
    'Connexion UTC': new Date(timestampTokenJwt * 1_000),
  });
};

export { initialise, identifieUtilisateur, controleurErreurs, logueErreur };
export type { SourceMss };
