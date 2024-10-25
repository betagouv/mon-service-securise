const { Identite } = require('./identite');

class Contributeur {
  constructor(donnees) {
    const { id, prenom, nom, postes } = donnees;
    this.id = id;
    this.identite = new Identite({ prenom, nom, postes });
  }

  prenomNom() {
    return this.identite.prenomNom();
  }

  initiales() {
    return this.identite.initiales();
  }

  posteDetaille() {
    return this.identite.posteDetaille();
  }
}

module.exports = { Contributeur };
