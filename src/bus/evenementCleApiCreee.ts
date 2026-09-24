import { EvenementMetier } from './evenementMetier.js';
import { CleApi } from '../modeles/cleApi.js';

type Donnees = { cle: CleApi; dureeValiditeEnJours: number };

export class EvenementCleApiCreee extends EvenementMetier<Donnees>([
  'cle',
  'dureeValiditeEnJours',
]) {}
