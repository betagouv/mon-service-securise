import * as z from 'zod';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export const valideBody =
  (objet: z.ZodType): RequestHandler =>
  async (requete: Request, reponse: Response, suite: NextFunction) => {
    const resultat = objet.safeParse(requete.body);
    return resultat.success ? suite() : reponse.sendStatus(400);
  };

export const valideParams =
  (objet: z.ZodType): RequestHandler =>
  async (requete: Request, reponse: Response, suite: NextFunction) => {
    const resultat = objet.safeParse(requete.params);
    return resultat.success ? suite() : reponse.sendStatus(400);
  };
