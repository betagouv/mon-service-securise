import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementGroupeEntitesCree = {
  idGroupe: UUID;
  idUtilisateur: UUID;
};

class EvenementGroupeEntitesCree extends Evenement {
  constructor(donnees: DonneesEvenementGroupeEntitesCree, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idGroupe',
      'idUtilisateur',
    ]);

    super(
      'GROUPE_ENTITES_CREE',
      {
        idGroupe: adaptateurChiffrement.hacheSha256(donnees.idGroupe),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

export default EvenementGroupeEntitesCree;
