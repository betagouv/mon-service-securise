import { NextFunction, Request, Response } from 'express';
import { UUID } from '../typesBasiques.js';
import { CleApi } from '../modeles/cleApi.js';

export type RequeteApiPublique = Request & {
  idUtilisateurCourant?: UUID;
  idCleApiCourante?: UUID;
};

type DepotPourAuthentification = {
  lisCleParValeur: (valeurEnClair: string) => Promise<CleApi | undefined>;
};

const valeurDuJetonBearer = (enTeteAuthorization?: string) => {
  const [schema, valeur] = enTeteAuthorization?.split(' ') ?? [];
  return schema === 'Bearer' ? valeur : undefined;
};

export const authentificationParCleApi =
  ({ depotDonnees }: { depotDonnees: DepotPourAuthentification }) =>
  async (
    requete: RequeteApiPublique,
    reponse: Response,
    suite: NextFunction
  ): Promise<void> => {
    const refuse = () => {
      reponse
        .status(401)
        .set('WWW-Authenticate', 'Bearer')
        .json({ erreur: 'CLE_API_INVALIDE' });
    };

    const valeurEnClair = valeurDuJetonBearer(requete.headers.authorization);
    if (!valeurEnClair) {
      refuse();
      return;
    }

    const cle = await depotDonnees.lisCleParValeur(valeurEnClair);
    if (!cle || cle.estRevoquee() || cle.estExpiree()) {
      refuse();
      return;
    }

    requete.idUtilisateurCourant = cle.donnees().idUtilisateur;
    requete.idCleApiCourante = cle.donnees().id;
    suite();
  };
