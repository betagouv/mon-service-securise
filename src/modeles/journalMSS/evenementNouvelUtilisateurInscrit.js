const Evenement = require('./evenement');

class EvenementNouvelUtilisateurInscrit extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, ['idUtilisateur']);

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
