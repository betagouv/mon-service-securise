const Evenement = require('./evenement');
const {
  ErreurIdentifiantUtilisateurManquant,
  ErreurDateDerniereConnexionManquante,
  ErreurDateDerniereConnexionInvalide,
} = require('./erreurs');

class EvenementConnexionUtilisateur extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idUtilisateur)
        throw new ErreurIdentifiantUtilisateurManquant();
      if (!donnees.dateDerniereConnexion)
        throw new ErreurDateDerniereConnexionManquante();
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
