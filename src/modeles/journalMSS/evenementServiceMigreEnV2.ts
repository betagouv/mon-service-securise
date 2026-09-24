import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = { idService: UUID; idUtilisateur: UUID };

class EvenementServiceMigreEnV2 extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'SERVICE_V1_MIGRE_EN_V2';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService', 'idUtilisateur'];
  }

  protected override donneesAConsigner(
    { idService, idUtilisateur }: Donnees,
    hache: Hacheur
  ) {
    return {
      idService: hache(idService),
      idUtilisateur: hache(idUtilisateur),
    };
  }
}

export default EvenementServiceMigreEnV2;
