import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { VersionService } from '../versionService.js';

type Donnees = {
  idService: UUID;
  idUtilisateur: UUID;
  versionService: VersionService;
};

class EvenementNouveauServiceCree extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'NOUVEAU_SERVICE_CREE';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService', 'idUtilisateur', 'versionService'];
  }

  protected override donneesAConsigner(
    { idService, idUtilisateur, versionService }: Donnees,
    hache: Hacheur
  ) {
    return {
      idService: hache(idService),
      idUtilisateur: hache(idUtilisateur),
      versionService,
    };
  }
}

export default EvenementNouveauServiceCree;
