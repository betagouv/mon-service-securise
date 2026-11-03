import Service from '../modeles/service.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { UUID } from '../typesBasiques.js';

export class ServicesSansMesuresAppliquees {
  private readonly depotDonnees;

  constructor({ depotDonnees }: { depotDonnees: DepotDonnees }) {
    this.depotDonnees = depotDonnees;
  }

  async calculePour(
    idUtilisateur: UUID,
    services: Service[]
  ): Promise<Service[]> {
    const modeles =
      await this.depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
        idUtilisateur
      );

    return services.filter((s) =>
      modeles.some(
        (m: { id: UUID }) =>
          s.mesuresSpecifiques().avecIdModele(m.id) === undefined
      )
    );
  }
}
