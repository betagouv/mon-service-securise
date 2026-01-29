import { FournisseurIdentite } from './fournisseurIdentite.interface.js';
import { AdaptateurOidc } from '../adaptateurs/adaptateurOidc.interface.js';

type AccessToken = string;

export class FournisseurIdentiteProConnect
  implements FournisseurIdentite<AccessToken>
{
  constructor(
    private readonly configuration: { adaptateurOidc: AdaptateurOidc } // eslint-disable-next-line no-empty-function
  ) {}

  async recupere(accessToken: string) {
    return this.configuration.adaptateurOidc.recupereInformationsUtilisateur(
      accessToken
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async metsAJour() {
    // Impossible de mettre à jour des informations ProConnect
  }
}
