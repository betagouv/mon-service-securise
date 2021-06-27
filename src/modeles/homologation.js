class Homologation {
  constructor({ id, idUtilisateur, nomService, natureService = [] }, referentiel) {
    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.nomService = nomService;
    this.natureService = natureService;

    this.referentiel = referentiel;
  }

  descriptionNatureService() {
    return this.referentiel.natureService(this.natureService);
  }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
