class Utilisateur {
  constructor({ id, prenom, nom, email }, adaptateurJWT) {
    this.id = id;
    this.prenom = prenom;
    this.nom = nom;
    this.email = email;
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
