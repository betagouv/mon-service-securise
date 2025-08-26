import copie from '../../utilitaires/copie.js';

class ObjetPersistanceService {
  constructor(donneesService) {
    this.donnees = donneesService;
  }

  sauf(...nomsProprietes) {
    const nouvellesDonnees = copie(this.donnees);
    nomsProprietes.forEach(
      (nomPropriete) => delete nouvellesDonnees[nomPropriete]
    );
    return nouvellesDonnees;
  }

  toutes() {
    return this.donnees;
  }
}

export default ObjetPersistanceService;
