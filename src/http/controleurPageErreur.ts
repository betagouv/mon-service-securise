import { NextFunction, Request, Response } from 'express';
import { statutPageErreur } from './statutPageErreur.js';

export const controleurPageErreur = (
  erreur: Error & { status?: number },
  _requete: Request,
  reponse: Response & { sentry?: string },
  suite: NextFunction
) => {
  if (erreur.message === 'CSRF token mismatch') {
    return suite(erreur);
  }
  return reponse
    .status(
      statutPageErreur({
        statutErreur: erreur.status,
        statutReponse: reponse.statusCode,
      })
    )
    .render('erreur', { idSentry: reponse.sentry });
};
