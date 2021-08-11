const Base = require('./base');

class Utilisateur extends Base {
  constructor(donnees, adaptateurJWT) {
    super(['id', 'prenom', 'nom', 'email']);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
  }

  toJSON() {
    return { prenomNom: `${this.prenom} ${this.nom}` };
  }

  genereToken(callback) {
    return this.adaptateurJWT.genereToken(this.id, callback);
  }
}

module.exports = Utilisateur;
