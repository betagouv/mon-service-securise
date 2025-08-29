import Entite from './entite.js';

class Superviseur {
  constructor(donnees) {
    const { idUtilisateur, entitesSupervisees } = donnees;
    this.idUtilisateur = idUtilisateur;
    this.entitesSupervisees = entitesSupervisees.map(
      (donneesEntite) => new Entite(donneesEntite)
    );
  }
}

export default Superviseur;
