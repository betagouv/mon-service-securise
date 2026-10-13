import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';

export type DonneesEvenementEntitesDuGroupeModifiees = {
  idGroupe: UUID;
  idUtilisateur: UUID;
  nombreEntitesAssociees: number;
};

class EvenementEntitesDuGroupeModifiees extends Evenement {
  constructor(donnees: DonneesEvenementEntitesDuGroupeModifiees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idGroupe',
      'idUtilisateur',
      'nombreEntitesAssociees',
    ]);

    super(
      'ENTITES_DU_GROUPE_MODIFIEES',
      {
        idGroupe: adaptateurChiffrement.hacheSha256(donnees.idGroupe),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        nombreEntitesAssociees: donnees.nombreEntitesAssociees,
      },
      date
    );
  }
}

export default EvenementEntitesDuGroupeModifiees;
