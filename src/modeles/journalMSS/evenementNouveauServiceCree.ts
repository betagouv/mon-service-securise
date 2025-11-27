import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';
import { VersionService } from '../versionService.js';

class EvenementNouveauServiceCree extends Evenement {
  constructor(
    donnees: {
      idService: UUID;
      idUtilisateur: UUID;
      versionService: VersionService;
    },
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idService',
      'idUtilisateur',
      'versionService',
    ]);

    super(
      'NOUVEAU_SERVICE_CREE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        versionService: donnees.versionService,
      },
      date
    );
  }
}

export default EvenementNouveauServiceCree;
