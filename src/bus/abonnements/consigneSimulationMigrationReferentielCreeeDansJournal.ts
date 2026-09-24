import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementSimulationMigrationReferentielCreee from '../../modeles/journalMSS/evenementSimulationMigrationReferentielCreee.js';
import MssSimulationMigrationReferentielCreee from '../evenementSimulationMigrationReferentielCreee.js';

const consigneSimulationMigrationReferentielCreee = consigneDansJournal(
  ({ service }: MssSimulationMigrationReferentielCreee) =>
    new EvenementSimulationMigrationReferentielCreee({ idService: service.id })
);

export { consigneSimulationMigrationReferentielCreee };
