import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = { idService: UUID };

class EvenementServiceSupprime extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'SERVICE_SUPPRIME';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService'];
  }

  protected override donneesAConsigner({ idService }: Donnees, hache: Hacheur) {
    return { idService: hache(idService) };
  }
}

export default EvenementServiceSupprime;
