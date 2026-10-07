import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementGroupeServicesCree = {
  idGroupe: UUID;
  idUtilisateur: UUID;
};

class EvenementGroupeServicesCree extends Evenement {
  constructor(donnees: DonneesEvenementGroupeServicesCree, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idGroupe',
      'idUtilisateur',
    ]);

    super(
      'GROUPE_SERVICES_CREE',
      {
        idGroupe: adaptateurChiffrement.hacheSha256(donnees.idGroupe),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

export default EvenementGroupeServicesCree;
