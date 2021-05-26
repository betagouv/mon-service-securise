class Homologation {
  constructor({ id, idUtilisateur, nomService }) {
    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.nomService = nomService;
  }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
