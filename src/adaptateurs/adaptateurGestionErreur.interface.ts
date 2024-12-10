import { Application, Request, Response, NextFunction } from 'express';

interface AdaptateurGestionErreur {
  initialise: (applicationExpress: Application) => void;
  controleurErreurs: (
    erreur: Error,
    requete: Request,
    reponse: Response,
    suite: NextFunction
  ) => void;
  logueErreur: (erreur: Error, infosDeContexte: Record<string, string>) => void;
}

export = AdaptateurGestionErreur;
