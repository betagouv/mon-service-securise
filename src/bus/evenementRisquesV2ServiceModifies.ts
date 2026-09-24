import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';
import { RisquesV2 } from '../moteurRisques/v2/risquesV2.js';

type Donnees = { idService: UUID; risques: RisquesV2 };

export class EvenementRisquesV2ServiceModifies extends EvenementMetier<Donnees>(
  ['idService', 'risques']
) {}
