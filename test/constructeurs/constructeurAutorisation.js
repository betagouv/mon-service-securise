const {
  tousDroitsEnEcriture,
} = require('../../src/modeles/autorisations/gestionDroits');
const AutorisationCreateur = require('../../src/modeles/autorisations/autorisationCreateur');
const AutorisationContributeur = require('../../src/modeles/autorisations/autorisationContributeur');

class ConstructeurAutorisation {
  constructor() {
    this.donnees = {
      id: '',
      idUtilisateur: '',
      idHomologation: '',
      idService: '',
      type: 'contributeur',
      droits: {},
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

  avecDroits(droits) {
    this.donnees.droits = droits;
    return this;
  }

  avecTousDroitsEcriture() {
    this.donnees.droits = tousDroitsEnEcriture();
    return this;
  }

  construis() {
    return this.donnees.type === 'createur'
      ? new AutorisationCreateur(this.donnees)
      : new AutorisationContributeur(this.donnees);
  }
}

const uneAutorisation = () => new ConstructeurAutorisation();

module.exports = { uneAutorisation };
