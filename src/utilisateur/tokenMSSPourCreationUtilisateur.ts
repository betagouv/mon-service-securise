import { AdaptateurJWT } from '../adaptateurs/adaptateurJWT.interface.js';
import { ErreurJWTManquant } from '../erreurs.js';
import { DonneesUtilisateur } from './serviceApresAuthentification.js';

export class TokenMSSPourCreationUtilisateur {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly adaptateurJWT: AdaptateurJWT) {}

  cree(donneesDansToken: DonneesUtilisateur): string {
    return this.adaptateurJWT.signeDonnees(donneesDansToken);
  }

  lis(token: string): DonneesUtilisateur {
    try {
      return this.adaptateurJWT.decode(token) as DonneesUtilisateur;
    } catch (e) {
      throw new Error(
        e instanceof ErreurJWTManquant
          ? 'Le token est requis'
          : 'Le token est invalide'
      );
    }
  }
}
