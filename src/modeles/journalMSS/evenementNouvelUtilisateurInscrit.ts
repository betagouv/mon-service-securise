const Evenement = require('./evenement');
const { ErreurIdentifiantUtilisateurManquant } = require('./erreurs');

class EvenementNouvelUtilisateurInscrit extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idUtilisateur)
        throw new ErreurIdentifiantUtilisateurManquant();
    };

    valide();

    super(
      'NOUVEL_UTILISATEUR_INSCRIT',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

module.exports = EvenementNouvelUtilisateurInscrit;
