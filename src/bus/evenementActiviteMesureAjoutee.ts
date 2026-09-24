import { EvenementMetier } from './evenementMetier.js';
import ActiviteMesure from '../modeles/activiteMesure.js';

type Donnees = { activiteMesure: ActiviteMesure };

export class EvenementActiviteMesureAjoutee extends EvenementMetier<Donnees>([
  'activiteMesure',
]) {}
