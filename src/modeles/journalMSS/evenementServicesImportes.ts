import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { VersionService } from '../versionService.js';

type Donnees = {
  idUtilisateur: UUID;
  nbServicesImportes: number;
  versionServicesImportes?: VersionService;
};

class EvenementServicesImportes extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'SERVICES_IMPORTES';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idUtilisateur', 'nbServicesImportes'];
  }

  protected override donneesAConsigner(
    { idUtilisateur, nbServicesImportes, versionServicesImportes }: Donnees,
    hache: Hacheur
  ) {
    return {
      idUtilisateur: hache(idUtilisateur),
      nbServicesImportes,
      versionServicesImportes,
    };
  }
}

export default EvenementServicesImportes;
