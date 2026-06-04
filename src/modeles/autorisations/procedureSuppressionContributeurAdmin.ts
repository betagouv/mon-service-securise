import { UUID } from '../../typesBasiques.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';

export class ProcedureSuppressionContributeurAdmin {
  private readonly depotDonnees: DepotDonnees;

  constructor({ depotDonnees }: { depotDonnees: DepotDonnees }) {
    this.depotDonnees = depotDonnees;
  }

  async execute(idUtilisateur: UUID, idService: UUID) {
    await this.depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService(
      idUtilisateur,
      idService
    );
    await this.depotDonnees.supprimeContributeurAdmin(idUtilisateur, idService);
  }
}
