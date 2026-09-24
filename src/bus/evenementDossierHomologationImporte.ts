import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';
import Dossier from '../modeles/dossier.js';

type Donnees = { idService: UUID; dossier: Dossier; idUtilisateur: UUID };

class EvenementDossierHomologationImporte extends EvenementMetier<Donnees>([
  'idService',
  'dossier',
  'idUtilisateur',
]) {
  readonly importe = true;
}

export default EvenementDossierHomologationImporte;
