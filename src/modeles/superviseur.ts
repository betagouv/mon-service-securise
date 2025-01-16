const Entite = require('./entite');

class Superviseur {
  constructor(donnees) {
    const { idUtilisateur, entitesSupervisees } = donnees;
    this.idUtilisateur = idUtilisateur;
    this.entitesSupervisees = entitesSupervisees.map(
      (donneesEntite) => new Entite(donneesEntite)
    );
  }
}

module.exports = Superviseur;
