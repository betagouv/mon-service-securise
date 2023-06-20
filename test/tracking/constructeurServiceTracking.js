class ConstructeurServiceTracking {
  constructor() {
    this.nombreMoyenContributeursPourUtilisateur = 0;
    this.completudeDesServicesPourUtilisateur = {
      nbServices: 9,
      nbMoyenContributeurs: this.nombreMoyenContributeursPourUtilisateur,
      tauxCompletudeMoyenTousServices: 0,
    };
  }

  construis() {
    return {
      nombreMoyenContributeursPourUtilisateur: async () =>
        this.nombreMoyenContributeursPourUtilisateur,
      completudeDesServicesPourUtilisateur: async () =>
        this.completudeDesServicesPourUtilisateur,
    };
  }
}

const unServiceTracking = () => new ConstructeurServiceTracking();

module.exports = { unServiceTracking };
