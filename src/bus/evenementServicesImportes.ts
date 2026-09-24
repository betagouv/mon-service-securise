import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';
import { VersionService } from '../modeles/versionService.js';

type Donnees = {
  idUtilisateur: UUID;
  nbServicesImportes: number;
  versionServicesImportes?: VersionService;
};

class EvenementServicesImportes extends EvenementMetier<Donnees>([
  'idUtilisateur',
  'nbServicesImportes',
]) {}

export default EvenementServicesImportes;
