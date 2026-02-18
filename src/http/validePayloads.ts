import * as z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { fabriqueAdaptateurGestionErreur } from '../adaptateurs/fabriqueAdaptateurGestionErreur.js';

const regexUUID =
  /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi;

const loguerDetailsDuRejet = (
  requete: Request<unknown, unknown, unknown, unknown, never>,
  resultatZod: object,
  cible: 'BODY' | 'PARAMS' | 'QUERY'
) => {
  if (process.env.API_ACTIVE_LOG_DES_ERREURS_400 !== 'true') return;

  const urlSansUUID = requete.originalUrl.replaceAll(regexUUID, ':id');

  fabriqueAdaptateurGestionErreur().logueErreur(
    new Error(`Erreur 400 sur ${requete.method} ${urlSansUUID}`),
    {
      cible,
      url: requete.url,
      body: requete.body,
      params: requete.params,
      query: requete.query,
      resultatZod,
    }
  );
};

export const valideBody =
  <TZod extends z.ZodType, TBody extends z.infer<TZod>>(objet: TZod) =>
  async (
    requete: Request<unknown, unknown, TBody, unknown, never>,
    reponse: Response,
    suite: NextFunction
  ) => {
    const resultat = objet.safeParse(requete.body);

    if (!resultat.success) {
      loguerDetailsDuRejet(requete, resultat, 'BODY');
      return reponse.sendStatus(400);
    }

    // Ici on veut bel et bien ré-écrire la requête, car c'est comme ça qu'expressjs est conçu.
    // On réassigne pour que les suivants récupèrent le contenu assaini par Zod.
    requete.body = resultat.data as TBody;

    return suite();
  };

export const valideParams =
  <TZod extends z.ZodType, TParams extends z.infer<TZod>>(objet: TZod) =>
  async (
    requete: Request<TParams, unknown, unknown, unknown, never>,
    reponse: Response,
    suite: NextFunction
  ) => {
    const resultat = objet.safeParse(requete.params);

    if (!resultat.success) {
      loguerDetailsDuRejet(requete, resultat, 'PARAMS');
      return reponse.sendStatus(400);
    }

    // Ici on veut bel et bien ré-écrire la requête, car c'est comme ça qu'expressjs est conçu.
    // On réassigne pour que les suivants récupèrent le contenu assaini par Zod.
    requete.params = resultat.data as TParams;

    return suite();
  };

export const valideQuery =
  <TZod extends z.ZodType, TQuery extends z.infer<TZod>>(objet: TZod) =>
  async (
    requete: Request<unknown, unknown, unknown, TQuery, never>,
    reponse: Response,
    suite: NextFunction
  ) => {
    const resultat = objet.safeParse(requete.query);

    if (!resultat.success) {
      loguerDetailsDuRejet(requete, resultat, 'QUERY');
      return reponse.sendStatus(400);
    }

    // Ici on veut bel et bien ré-écrire la requête, car c'est comme ça qu'expressjs est conçu.
    // On réassigne pour que les suivants récupèrent le contenu assaini par Zod.
    requete.query = resultat.data as TQuery;

    return suite();
  };
