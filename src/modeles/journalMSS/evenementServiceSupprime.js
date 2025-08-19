const Evenement = require('./evenement');

class EvenementServiceSupprime extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['idService']);

    super(
      'SERVICE_SUPPRIME',
      { idService: adaptateurChiffrement.hacheSha256(donnees.idService) },
      date
    );
  }
}

module.exports = EvenementServiceSupprime;
