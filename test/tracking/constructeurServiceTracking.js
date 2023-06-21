class ConstructeurServiceTracking {
  constructor() {
    this.nombreMoyenContributeursPourUtilisateur = 0;
    this.completudeDesServicesPourUtilisateur = {
      nbServices: 9,
      nbMoyenContributeurs: this.nombreMoyenContributeursPourUtilisateur,
      tauxCompletudeMoyenTousServices: 0,
    };
  }

  avecCompletudeDesServices(
    nbServices,
    nbMoyenContributeurs,
    tauxCompletudeMoyenTousServices
  ) {
    this.completudeDesServicesPourUtilisateur = {
      nbServices,
      nbMoyenContributeurs,
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
