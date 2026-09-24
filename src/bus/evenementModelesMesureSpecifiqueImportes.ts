import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = {
  idUtilisateur: UUID;
  nbModelesMesureSpecifiqueImportes: number;
};

class EvenementModelesMesureSpecifiqueImportes extends EvenementMetier<Donnees>(
  ['idUtilisateur', 'nbModelesMesureSpecifiqueImportes']
) {}

export default EvenementModelesMesureSpecifiqueImportes;
