import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { VersionService } from '../versionService.js';

class EvenementServicesImportes extends Evenement {
  constructor(
    donnees: {
      idUtilisateur: UUID;
      nbServicesImportes: number;
      versionServicesImportes?: VersionService;
    },
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idUtilisateur',
      'nbServicesImportes',
    ]);

    super(
      'SERVICES_IMPORTES',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        nbServicesImportes: donnees.nbServicesImportes,
        versionServicesImportes: donnees.versionServicesImportes,
      },
      date
    );
  }
}

export default EvenementServicesImportes;
