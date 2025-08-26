import Evenement from './evenement.js';

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

export default EvenementServicesImportes;
