const AdaptateurChiffrement = require('../../adaptateurs/adaptateurChiffrement');

const { ErreurIdentifiantServiceManquant, ErreurIdentifiantUtilisateurManquant } = require('./erreurs');

class Evenements {
  constructor(type, donnees, date) {
    this.type = type;
    this.donnees = donnees;
    this.date = date;
  }

  toJSON() {
    return {
      type: this.type,
      donnees: this.donnees,
      date: this.date,
    };
  }
}

class EvenementNouveauServiceCree extends Evenements {
  constructor(donnees, options = {}) {
    const {
      date = Date.now(),
      adaptateurChiffrement = AdaptateurChiffrement,
    } = options;

    const valide = () => {
      if (!donnees.idService) throw new ErreurIdentifiantServiceManquant();
      if (!donnees.idUtilisateur) throw new ErreurIdentifiantUtilisateurManquant();
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

module.exports = { EvenementNouveauServiceCree };
