import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementGroupeServicesSupprime = {
  idGroupe: UUID;
  idUtilisateur: UUID;
};

class EvenementGroupeServicesSupprime extends Evenement {
  constructor(donnees: DonneesEvenementGroupeServicesSupprime, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idGroupe',
      'idUtilisateur',
    ]);

    super(
      'GROUPE_SERVICES_SUPPRIME',
      {
        idGroupe: adaptateurChiffrement.hacheSha256(donnees.idGroupe),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

export default EvenementGroupeServicesSupprime;
