import { UUID } from '../typesBasiques.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';
import { AdaptateurJWT } from '../adaptateurs/adaptateurJWT.interface.js';
import { DepotDonnees } from '../depotDonnees.interface.js';

export type UtilisateurCourant = {
  prenomNom: string;
  email: string;
  source: SourceAuthentification;
  id: UUID;
  timestampConnexion: number;
};

export const lisUtilisateurCourant = async (
  tokenJWT: string,
  adaptateurJWT: AdaptateurJWT,
  depotDonnees: DepotDonnees
): Promise<UtilisateurCourant | undefined> => {
  try {
    const token = adaptateurJWT.decode(tokenJWT) as {
      idUtilisateur: UUID;
      iat: number;
      source: SourceAuthentification;
    };
    const estRevoque = await depotDonnees.estJwtRevoque(tokenJWT);
    if (estRevoque) return undefined;

    const utilisateur = await depotDonnees.utilisateur(token.idUtilisateur);
    if (!utilisateur) return undefined;

    return {
      id: utilisateur.id,
      prenomNom: utilisateur.prenomNom(),
      email: utilisateur.email,
      source: token.source,
      timestampConnexion: token.iat,
    } as UtilisateurCourant;
  } catch {
    return undefined;
  }
};
