import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = { idUtilisateur: UUID; cguAcceptees: string };

class EvenementCguAcceptees extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'CGU_ACCEPTEES';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idUtilisateur', 'cguAcceptees'];
  }

  protected override donneesAConsigner(
    { idUtilisateur, cguAcceptees }: Donnees,
    hache: Hacheur
  ) {
    return { idUtilisateur: hache(idUtilisateur), cguAcceptees };
  }
}

export default EvenementCguAcceptees;
