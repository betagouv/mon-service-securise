import Evenement from './evenement.js';

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

export default EvenementNouvelUtilisateurInscrit;
