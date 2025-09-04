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

    if (!resultat.success) return reponse.sendStatus(400);

    // Ici on veut bel et bien ré-écrire la requête, car c'est comme ça qu'expressjs est conçu.
    // On réassigne `body` pour que les suivants récupèrent le contenu assaini par Zod.
    // eslint-disable-next-line no-param-reassign
    requete.body = resultat.data as TBody;

    return suite();
  };

export const valideParams =
  (objet: z.ZodType): RequestHandler =>
  async (requete: Request, reponse: Response, suite: NextFunction) => {
    const resultat = objet.safeParse(requete.params);
    return resultat.success ? suite() : reponse.sendStatus(400);
  };
