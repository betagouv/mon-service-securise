const Evenement = require('./evenement');

class EvenementServiceRattacheAPrestataire extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idService',
      'codePrestataire',
    ]);

    super(
      'SERVICE_RATTACHE_A_PRESTATAIRE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        codePrestataire: donnees.codePrestataire,
      },
      date
    );
  }
}

module.exports = EvenementServiceRattacheAPrestataire;
