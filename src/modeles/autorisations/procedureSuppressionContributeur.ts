import { UUID } from '../../typesBasiques.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';

export class ProcedureSuppressionContributeur {
  private readonly depotDonnees: DepotDonnees;

  constructor({ depotDonnees }: { depotDonnees: DepotDonnees }) {
    this.depotDonnees = depotDonnees;
  }

  async execute(idUtilisateur: UUID, idService: UUID, idActeur: UUID) {
    await this.depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService(
      idUtilisateur,
      idService
    );
    await this.depotDonnees.supprimeContributeur(
      idUtilisateur,
      idService,
      idActeur
    );
  }
}
