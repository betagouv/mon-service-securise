import copie from '../../utilitaires/copie.js';

class ObjetPersistanceService<TDonnees extends Record<string, unknown>> {
  private readonly donnees: TDonnees;

  constructor(donneesService: TDonnees) {
    this.donnees = donneesService;
  }

  sauf<TPropriete extends keyof TDonnees>(
    ...nomsProprietes: TPropriete[]
  ): Omit<TDonnees, TPropriete> {
    const nouvellesDonnees = copie(this.donnees);
    nomsProprietes.forEach(
      (nomPropriete) => delete nouvellesDonnees[nomPropriete]
    );
    return nouvellesDonnees;
  }

  toutes(): TDonnees {
    return this.donnees;
  }
}

export default ObjetPersistanceService;
