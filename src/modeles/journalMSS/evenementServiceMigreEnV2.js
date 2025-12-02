import Evenement from './evenement.js';

class EvenementServiceMigreEnV2 extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idService',
      'idUtilisateur',
    ]);

    super(
      'SERVICE_V1_MIGRE_EN_V2',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

export default EvenementServiceMigreEnV2;
