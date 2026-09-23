import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementCleApiCreee = {
  idCle: UUID;
  idUtilisateur: UUID;
  dureeValiditeEnJours: number;
  dateCreation: Date;
  dateExpiration: Date;
};

class EvenementCleApiCreee extends Evenement {
  constructor(donnees: DonneesEvenementCleApiCreee, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idCle',
      'idUtilisateur',
      'dureeValiditeEnJours',
      'dateCreation',
      'dateExpiration',
    ]);

    super(
      'CLE_API_CREEE',
      {
        idCle: adaptateurChiffrement.hacheSha256(donnees.idCle),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        dureeValiditeEnJours: donnees.dureeValiditeEnJours,
        dateCreation: donnees.dateCreation,
        dateExpiration: donnees.dateExpiration,
      },
      date
    );
  }
}

export default EvenementCleApiCreee;
