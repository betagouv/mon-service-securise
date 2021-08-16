const Base = require('./base');

class Utilisateur extends Base {
  constructor(donnees = {}, adaptateurJWT) {
    super(['id', 'prenom', 'nom', 'email', 'cguAcceptees']);
    this.renseigneProprietes(donnees);
    this.adaptateurJWT = adaptateurJWT;
  }

  accepteCGU() {
    return !!this.cguAcceptees;
  }

  genereToken(callback) {
    return this.adaptateurJWT.genereToken(this.id, callback);
  }

  toJSON() {
    return { prenomNom: `${this.prenom} ${this.nom}` };
  }
}

module.exports = Utilisateur;
