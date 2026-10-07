import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementServicesDuGroupeModifies = {
  idGroupe: UUID;
  idUtilisateur: UUID;
  nombreServicesAssocies: number;
};

class EvenementServicesDuGroupeModifies extends Evenement {
  constructor(donnees: DonneesEvenementServicesDuGroupeModifies, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idGroupe',
      'idUtilisateur',
      'nombreServicesAssocies',
    ]);

    super(
      'SERVICES_DU_GROUPE_MODIFIES',
      {
        idGroupe: adaptateurChiffrement.hacheSha256(donnees.idGroupe),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        nombreServicesAssocies: donnees.nombreServicesAssocies,
      },
      date
    );
  }
}

export default EvenementServicesDuGroupeModifies;
