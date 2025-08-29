import Evenement from './evenement.js';

class EvenementCguAcceptees extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idUtilisateur',
      'cguAcceptees',
    ]);

    super(
      'CGU_ACCEPTEES',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        cguAcceptees: donnees.cguAcceptees,
      },
      date
    );
  }
}

export default EvenementCguAcceptees;
