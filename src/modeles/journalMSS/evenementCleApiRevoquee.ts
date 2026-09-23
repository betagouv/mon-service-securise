import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementCleApiRevoquee = {
  idCle: UUID;
  idUtilisateur: UUID;
  dateRevocation: Date;
};

class EvenementCleApiRevoquee extends Evenement {
  constructor(donnees: DonneesEvenementCleApiRevoquee, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idCle',
      'idUtilisateur',
      'dateRevocation',
    ]);

    super(
      'CLE_API_REVOQUEE',
      {
        idCle: adaptateurChiffrement.hacheSha256(donnees.idCle),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        dateRevocation: donnees.dateRevocation,
      },
      date
    );
  }
}

export default EvenementCleApiRevoquee;
