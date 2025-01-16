const { Identite } = require('./identite');

class Contributeur {
  constructor(donneesUtilisateur) {
    const { id, email, prenom, nom, postes } = donneesUtilisateur;
    this.idUtilisateur = id;
    this.identite = new Identite({ email, prenom, nom, postes });
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
