const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Base = require('./base');

class ParcoursUtilisateur extends Base {
  constructor(donnees = {}, adaptateurHorloge = adaptateurHorlogeParDefaut) {
    super({
      proprietesAtomiquesRequises: [
        'id',
        'idUtilisateur',
        'dateDerniereConnexion',
      ],
    });
    this.renseigneProprietes(donnees);
    this.adaptateurHorloge = adaptateurHorloge;
  }

  enregistreDerniereConnexionMaintenant() {
    this.dateDerniereConnexion = this.adaptateurHorloge
      .maintenant()
      .toISOString();
  }
}

module.exports = ParcoursUtilisateur;
