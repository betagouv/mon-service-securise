import Superviseur from '../modeles/superviseur.js';
import { UUID } from '../typesBasiques.js';
import { PersistanceTS } from '../adaptateurs/persistanceTS.interface.js';

export class DepotDonneesSuperviseursOO {
  private readonly persistance: PersistanceTS;

  constructor({ persistance }: { persistance: PersistanceTS }) {
    this.persistance = persistance;
  }

  async lisSuperviseur(idUtilisateur: UUID): Promise<Superviseur | undefined> {
    const donnees = await this.persistance.lisSuperviseur(idUtilisateur);

    return donnees ? Superviseur.hydrate(donnees) : undefined;
  }
}
