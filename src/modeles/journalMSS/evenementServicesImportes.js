const Evenement = require('./evenement');

class EvenementServicesImportes extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idUtilisateur',
      'nbServicesImportes',
    ]);

    super(
      'SERVICES_IMPORTES',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        nbServicesImportes: donnees.nbServicesImportes,
      },
      date
    );
  }
}

module.exports = EvenementServicesImportes;
