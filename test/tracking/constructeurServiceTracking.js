class ConstructeurServiceTracking {
  constructor() {
    this.nombreMoyenContributeursPourUtilisateur = 0;
    this.completudeDesServicesPourUtilisateur = {
      nombreServices: 9,
      nombreMoyenContributeurs: this.nombreMoyenContributeursPourUtilisateur,
      tauxCompletudeMoyenTousServices: 0,
    };
  }

  avecCompletudeDesServices(
    nombreServices,
    nombreMoyenContributeurs,
    tauxCompletudeMoyenTousServices
  ) {
    this.completudeDesServicesPourUtilisateur = {
      nombreServices,
      nombreMoyenContributeurs,
      tauxCompletudeMoyenTousServices,
    };
    return this;
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
