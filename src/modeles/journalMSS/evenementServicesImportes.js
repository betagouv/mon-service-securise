const Evenement = require('./evenement');
const {
  ErreurIdentifiantUtilisateurManquant,
  ErreurNombreServicesImportes,
} = require('./erreurs');

class EvenementServicesImportes extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idUtilisateur))
        throw new ErreurIdentifiantUtilisateurManquant();
      if (manque(donnees.nbServicesImportes))
        throw new ErreurNombreServicesImportes();
    };

    valide();

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
