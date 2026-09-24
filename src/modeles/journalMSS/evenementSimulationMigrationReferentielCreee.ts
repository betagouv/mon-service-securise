import Evenement, { Hacheur } from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

type Donnees = { idService: UUID };

class EvenementSimulationMigrationReferentielCreee extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'SIMULATION_MIGRATION_REFERENTIEL_CREEE';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService'];
  }

  protected override donneesAConsigner({ idService }: Donnees, hache: Hacheur) {
    return { idService: hache(idService) };
  }
}

export default EvenementSimulationMigrationReferentielCreee;
