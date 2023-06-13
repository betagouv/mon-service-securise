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

  pourUtilisateur(idUtilisateur) {
    this.donnees.idUtilisateur = idUtilisateur;
    return this;
  }

  pourService(idService) {
    this.donnees.idHomologation = idService;
    this.donnees.idService = idService;
    return this;
  }

  enTantQueCreateur() {
    this.donnees.type = 'createur';
    return this;
  }

  enTantQueContributeur() {
    this.donnees.type = 'contributeur';
    return this;
  }

  construis() {
    return new AutorisationBase(this.donnees);
  }
}

module.exports = ConstructeurAutorisation;
