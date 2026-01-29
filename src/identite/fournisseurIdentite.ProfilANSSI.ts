import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
import { FournisseurIdentite } from './fournisseurIdentite.interface.js';

type IdentiteProfilANSSI = Parameters<AdaptateurProfilAnssi['metsAJour']>[0];

type Email = string;

export class FournisseurIdentiteProfilANSSI
  implements FournisseurIdentite<Email, IdentiteProfilANSSI>
{
  constructor(
    private readonly configuration: {
      adaptateurProfilAnssi: AdaptateurProfilAnssi;
    } // eslint-disable-next-line no-empty-function
  ) {}

  async recupere(email: Email) {
    return this.configuration.adaptateurProfilAnssi.recupere(email);
  }

  async metsAJour(identite: IdentiteProfilANSSI) {
    await this.configuration.adaptateurProfilAnssi.metsAJour(identite);
  }
}
