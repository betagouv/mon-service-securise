import { EvenementMetier } from './evenementMetier.js';
import type Service from '../modeles/service.js';

type Donnees = { service: Service };

class EvenementSimulationMigrationReferentielCreee extends EvenementMetier<Donnees>(
  ['service']
) {}

export default EvenementSimulationMigrationReferentielCreee;
