import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = { idService: UUID; codePrestataire: string };

export class EvenementServiceRattacheAPrestataire extends EvenementMetier<Donnees>(
  ['idService', 'codePrestataire']
) {}
