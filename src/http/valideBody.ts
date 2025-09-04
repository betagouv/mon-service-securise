import * as z from 'zod';
import { NextFunction, Request, Response } from 'express';

export const valideBody =
  <TZod extends z.ZodType, TBody extends z.infer<TZod>>(objet: TZod) =>
  async (
    requete: Request<unknown, unknown, TBody, unknown, never>,
    reponse: Response,
    suite: NextFunction
  ) => {
    const resultat = objet.safeParse(requete.body);
    return resultat.success ? suite() : reponse.sendStatus(400);
  };
