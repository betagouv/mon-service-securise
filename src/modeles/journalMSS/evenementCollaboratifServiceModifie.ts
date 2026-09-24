import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { Role } from '../autorisations/autorisation.js';

type Donnees = {
  idService: UUID;
  autorisations: { idUtilisateur: UUID; droit: Role }[];
};

class EvenementCollaboratifServiceModifie extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'COLLABORATIF_SERVICE_MODIFIE';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService', 'autorisations'];
  }

  protected override donneesAConsigner(
    { idService, autorisations }: Donnees,
    hache: Hacheur
  ) {
    return {
      idService: hache(idService),
      autorisations: autorisations.map(({ idUtilisateur, droit }) => ({
        idUtilisateur: hache(idUtilisateur),
        droit,
      })),
    };
  }
}

export { EvenementCollaboratifServiceModifie };
