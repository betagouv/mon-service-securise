import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = { idService: UUID; codePrestataire: string };

class EvenementServiceRattacheAPrestataire extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'SERVICE_RATTACHE_A_PRESTATAIRE';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService', 'codePrestataire'];
  }

  protected override donneesAConsigner(
    { idService, codePrestataire }: Donnees,
    hache: Hacheur
  ) {
    return { idService: hache(idService), codePrestataire };
  }
}

export default EvenementServiceRattacheAPrestataire;
