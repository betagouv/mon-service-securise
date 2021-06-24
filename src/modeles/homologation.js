class Homologation {
  constructor({ id, idUtilisateur, nomService, natureService }, referentiel) {
    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.nomService = nomService;
    this.natureService = natureService;

    this.referentiel = referentiel;
  }

  descriptionNatureService() {
    return this.natureService.map((ns) => this.referentiel.natureService[ns]).join(', ');
  }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
