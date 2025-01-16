const Evenement = require('./evenement');
const {
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
} = require('./erreurs');

class EvenementNouveauServiceCree extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idService) throw new ErreurIdentifiantServiceManquant();
      if (!donnees.idUtilisateur)
        throw new ErreurIdentifiantUtilisateurManquant();
    };

    valide();

    super(
      'NOUVEAU_SERVICE_CREE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

module.exports = EvenementNouveauServiceCree;
