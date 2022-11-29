const AdaptateurChiffrement = require('../../adaptateurs/adaptateurChiffrement');

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

    super(
      'NOUVEAU_SERVICE_CREE',
      { idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur) },
      date
    );
  }
}

module.exports = { EvenementNouveauServiceCree };
