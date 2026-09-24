import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = { idUtilisateur: UUID; cguAcceptees: string };

export class EvenementCguAccepteesParUtilisateur extends EvenementMetier<Donnees>(
  ['idUtilisateur', 'cguAcceptees']
) {}
