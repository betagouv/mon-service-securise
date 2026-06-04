import Evenement from './evenement.js';
import { UUID } from '../../typesBasiques.js';

class EvenementAccesUtilisateurAdministreRetires extends Evenement {
  constructor(
    donnees: {
      idAdmin: UUID;
      idUtilisateurAdministre: UUID;
      idsServices: UUID[];
    },
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idAdmin',
      'idUtilisateurAdministre',
      'idsServices',
    ]);

    super(
      'ACCES_UTILISATEUR_ADMINISTRE_RETIRES',
      {
        idAdmin: adaptateurChiffrement.hacheSha256(donnees.idAdmin),
        idUtilisateurAdministre: adaptateurChiffrement.hacheSha256(
          donnees.idUtilisateurAdministre
        ),
        idsServices: donnees.idsServices.map(adaptateurChiffrement.hacheSha256),
      },
      date
    );
  }
}

export default EvenementAccesUtilisateurAdministreRetires;
