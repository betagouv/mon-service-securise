import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

class EvenementSimulationMigrationReferentielCreee extends Evenement {
  constructor(donnees: { idService: UUID }, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['idService']);

    super(
      'SIMULATION_MIGRATION_REFERENTIEL_CREEE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
      },
      date
    );
  }
}

export default EvenementSimulationMigrationReferentielCreee;
