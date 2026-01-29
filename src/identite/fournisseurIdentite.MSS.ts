import { FournisseurIdentite } from './fournisseurIdentite.interface.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import Utilisateur from '../modeles/utilisateur.js';

type Email = string;

export class FournisseurIdentiteMSS
  implements FournisseurIdentite<Email, Utilisateur>
{
  constructor(
    private readonly configuration: { depotDonnees: DepotDonnees } // eslint-disable-next-line no-empty-function
  ) {}

  async recupere(email: Email) {
    return this.configuration.depotDonnees.utilisateurAvecEmail(email);
  }

  // eslint-disable-next-line class-methods-use-this
  async metsAJour(utilisateur: Utilisateur) {
    // TODO: WARNING: On fait lequel ?
    await this.configuration.depotDonnees.metsAJourUtilisateur(
      utilisateur.id,
      utilisateur
    );
    // TODO: OU
    await this.configuration.depotDonnees.rafraichisProfilUtilisateurLocal(
      utilisateur.id
    );
  }
}
