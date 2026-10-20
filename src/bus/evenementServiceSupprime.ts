import { UUID } from '../typesBasiques.js';

export type ContributeurDuServiceSupprime = {
  idUtilisateur: UUID;
};

class EvenementServiceSupprime {
  public readonly idService: UUID;
  public readonly autorisations: ContributeurDuServiceSupprime[];
  public readonly siret?: string;

  constructor({
    idService,
    autorisations,
    siret,
  }: {
    idService: UUID;
    autorisations: ContributeurDuServiceSupprime[];
    siret?: string;
  }) {
    if (!idService)
      throw Error("Impossible d'instancier l'événement sans ID de service");

    this.idService = idService;
    this.autorisations = autorisations;
    this.siret = siret;
  }
}

export default EvenementServiceSupprime;
