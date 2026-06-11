import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';

class EvenementAdminNommeSurOrganisation extends Evenement {
  constructor(
    donnees: {
      idActeur: UUID;
      idCible: UUID;
      siret: string;
    },
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idActeur',
      'idCible',
      'siret',
    ]);

    super(
      'ADMIN_NOMME_SUR_ORGANISATION',
      {
        idActeur: adaptateurChiffrement.hacheSha256(donnees.idActeur),
        idCible: adaptateurChiffrement.hacheSha256(donnees.idCible),
        siret: adaptateurChiffrement.hacheSha256(donnees.siret),
      },
      date
    );
  }
}

export default EvenementAdminNommeSurOrganisation;
