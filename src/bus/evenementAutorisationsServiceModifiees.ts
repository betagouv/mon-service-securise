import { Role } from '../modeles/autorisations/autorisation.js';
import { UUID } from '../typesBasiques.js';

export type AutorisationModifiee = {
  idUtilisateur: UUID;
  droit: Role;
};

export class EvenementAutorisationsServiceModifiees {
  public readonly idService: UUID;
  public readonly autorisations: AutorisationModifiee[];

  constructor({
    idService,
    autorisations,
  }: {
    idService: UUID;
    autorisations: AutorisationModifiee[];
  }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");
    if (!autorisations || autorisations.length === 0)
      throw Error("Impossible d'instancier l'événement sans autorisations");

    this.idService = idService;
    this.autorisations = autorisations;
  }
}
