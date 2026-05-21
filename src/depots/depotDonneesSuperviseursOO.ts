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

  async sauvegardeSuperviseur(superviseur: Superviseur): Promise<void> {
    await this.persistance.sauvegardeSuperviseur(superviseur.donnees());
  }

  async lisSuperviseursPour(siret: string): Promise<Array<Superviseur>> {
    const donnees = await this.persistance.lisSuperviseursOrganisation(siret);

    return donnees.map((d) => Superviseur.hydrate(d));
  }

  async estSuperviseur(idUtilisateur: UUID): Promise<boolean> {
    const superviseur = await this.lisSuperviseur(idUtilisateur);

    return superviseur !== undefined;
  }
}
