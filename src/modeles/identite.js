const { formatteListeFr } = require('../utilitaires/liste');

class Identite {
  constructor(donnees) {
    const { prenom, nom, email, postes } = donnees;
    this.prenom = prenom;
    this.nom = nom;
    this.email = email;
    this.postes = postes;
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

  prenomNom() {
    return [this.prenom, this.nom].join(' ').trim() || this.email;
  }

  posteDetaille() {
    return formatteListeFr(this.postes);
  }
}

module.exports = { Identite };
