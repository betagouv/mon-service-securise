const Evenement = require('./evenement');
const { ErreurDateDerniereConnexionInvalide } = require('./erreurs');

class EvenementConnexionUtilisateur extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      Evenement.valide(donnees, ['idUtilisateur', 'dateDerniereConnexion']);

      if (Number.isNaN(new Date(donnees.dateDerniereConnexion).valueOf()))
        throw new ErreurDateDerniereConnexionInvalide();
    };

    valide();

    super(
      'CONNEXION_UTILISATEUR',
      {
        ...donnees,
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

module.exports = EvenementConnexionUtilisateur;
