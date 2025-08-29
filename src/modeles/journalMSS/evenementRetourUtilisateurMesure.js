import Evenement from './evenement.js';

class EvenementRetourUtilisateurMesure extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idService',
      'idUtilisateur',
      'idMesure',
      'idRetour',
    ]);

    super(
      'RETOUR_UTILISATEUR_MESURE_RECU',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        idMesure: donnees.idMesure,
        idRetour: donnees.idRetour,
        commentaire: donnees.commentaire.substring(0, 2000),
      },
      date
    );
  }
}

export default EvenementRetourUtilisateurMesure;
