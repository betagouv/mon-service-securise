const AutorisationBase = require('../../src/modeles/autorisations/autorisationBase');

class ConstructeurAutorisation {
  constructor() {
    this.donnees = {
      id: '',
      idUtilisateur: '',
      idHomologation: '',
      idService: '',
      type: '',
    };
  }

  deCreateurDeService(idUtilisateur, idService) {
    this.donnees.type = 'createur';
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
    this.donnees.idHomologation = idService;
    return this;
  }

  deContributeurDeService(idUtilisateur, idService) {
    this.donnees.type = 'contributeur';
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
    this.donnees.idHomologation = idService;
    return this;
  }

  construis() {
    return new AutorisationBase(this.donnees);
  }
}

const uneAutorisation = () => new ConstructeurAutorisation();

module.exports = { uneAutorisation };
