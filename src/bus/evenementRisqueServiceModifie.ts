import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';

type Donnees = { service: Service };

class EvenementRisqueServiceModifie extends EvenementMetier<Donnees>([
  'service',
]) {}

export default EvenementRisqueServiceModifie;
