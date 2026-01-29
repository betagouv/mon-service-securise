import {
  FournisseurIdentite,
  Identite,
} from './fournisseurIdentite.interface.js';

export class FournisseurIdentitePriorise<TIdentifiant>
  implements FournisseurIdentite<TIdentifiant>
{
  constructor(
    private readonly fournisseurs: FournisseurIdentite<TIdentifiant>[] // eslint-disable-next-line no-empty-function
  ) {}

  async recupere(identifiant: TIdentifiant) {
    // eslint-disable-next-line no-restricted-syntax
    for (const fournisseur of this.fournisseurs) {
      // eslint-disable-next-line no-await-in-loop
      const identite = await fournisseur.recupere(identifiant);
      if (identite) return identite;
    }

    return undefined;
  }

  async metsAJour(identite: Identite) {
    await Promise.all(
      this.fournisseurs.map((fournisseur) => fournisseur.metsAJour(identite))
    );
  }
}
