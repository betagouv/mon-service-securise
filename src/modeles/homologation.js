const NatureService = require('./natureService');

class Homologation {
  constructor({ id, idUtilisateur, nomService, natureService = [] }, referentiel) {
    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.nomService = nomService;
    this.natureService = natureService.map(
      (identifiant) => new NatureService(identifiant, referentiel)
    );

    this.referentiel = referentiel;
  }

  descriptionNatureService() {
    if (this.natureService.length === 0) return 'Non renseigné';

    return this.natureService.map((ns) => ns.description()).join(', ');
  }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
