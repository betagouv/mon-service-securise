const AdaptateurChiffrement = require('../../adaptateurs/adaptateurChiffrement');

const { ErreurIdentifiantUtilisateurManquant } = require('./erreurs');

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
      if (!donnees.idUtilisateur) throw new ErreurIdentifiantUtilisateurManquant();
    };

    valide();

    super(
      'NOUVEAU_SERVICE_CREE',
      { idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur) },
      date
    );
  }
}

module.exports = { EvenementNouveauServiceCree };
