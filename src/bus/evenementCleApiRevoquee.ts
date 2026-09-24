import { EvenementMetier } from './evenementMetier.js';
import { CleApi } from '../modeles/cleApi.js';

type Donnees = { cle: CleApi };

export class EvenementCleApiRevoquee extends EvenementMetier<Donnees>([
  'cle',
]) {}
