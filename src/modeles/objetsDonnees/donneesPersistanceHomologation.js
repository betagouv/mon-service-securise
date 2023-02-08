const copie = require('../../utilitaires/copie');

class DonneesPersistanceHomologation {
  constructor(donneesHomologation) {
    this.donnees = donneesHomologation;
  }

  sauf(...nomsProprietes) {
    const nouvellesDonnees = copie(this.donnees);
    nomsProprietes.forEach((nomPropriete) => delete nouvellesDonnees[nomPropriete]);
    return nouvellesDonnees;
  }

  toutes() {
    return this.donnees;
  }
}

module.exports = DonneesPersistanceHomologation;
