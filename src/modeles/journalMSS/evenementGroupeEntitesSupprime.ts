import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementGroupeEntitesSupprime = {
  idGroupe: UUID;
  idUtilisateur: UUID;
};

class EvenementGroupeEntitesSupprime extends Evenement {
  constructor(donnees: DonneesEvenementGroupeEntitesSupprime, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idGroupe',
      'idUtilisateur',
    ]);

    super(
      'GROUPE_ENTITES_SUPPRIME',
      {
        idGroupe: adaptateurChiffrement.hacheSha256(donnees.idGroupe),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

export default EvenementGroupeEntitesSupprime;
