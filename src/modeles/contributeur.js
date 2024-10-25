const { formatteListeFr } = require('../utilitaires/liste');

class Contributeur {
  constructor(donnees) {
    const { id, prenom, nom, postes } = donnees;
    this.id = id;
    this.prenom = prenom;
    this.nom = nom;
    this.postes = postes;
  }

  prenomNom() {
    return `${this.prenom} ${this.nom}`;
  }

  initiales() {
    const premiereLettreMajuscule = (s) =>
      typeof s === 'string' ? s.charAt(0).toUpperCase() : '';

    return (
      `${premiereLettreMajuscule(this.prenom)}${premiereLettreMajuscule(
        this.nom
      )}` || ''
    );
  }

  posteDetaille() {
    return formatteListeFr(this.postes);
  }
}

module.exports = { Contributeur };
