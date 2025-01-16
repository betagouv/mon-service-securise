const Evenement = require('./evenement');
const {
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurIdentifiantMesureManquant,
  ErreurIdentifiantRetourUtilisateurManquant,
} = require('./erreurs');

class EvenementRetourUtilisateurMesure extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idService))
        throw new ErreurIdentifiantServiceManquant();
      if (manque(donnees.idUtilisateur))
        throw new ErreurIdentifiantUtilisateurManquant();
      if (manque(donnees.idMesure)) throw new ErreurIdentifiantMesureManquant();
      if (manque(donnees.idRetour))
        throw new ErreurIdentifiantRetourUtilisateurManquant();
    };

    valide();

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

module.exports = EvenementRetourUtilisateurMesure;
