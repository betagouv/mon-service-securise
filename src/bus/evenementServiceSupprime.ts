import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = { idService: UUID; autorisations: { idUtilisateur: UUID }[] };

class EvenementServiceSupprime extends EvenementMetier<Donnees>([
  'idService',
  'autorisations',
]) {}

export default EvenementServiceSupprime;
