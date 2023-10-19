const {
  tousDroitsEnEcriture,
} = require('../../src/modeles/autorisations/gestionDroits');
const AutorisationBase = require('../../src/modeles/autorisations/autorisationBase');

class ConstructeurAutorisation {
  constructor() {
    this.donnees = {
      estProprietaire: false,
      id: '',
      idUtilisateur: '',
      idHomologation: '',
      idService: '',
      type: 'contributeur',
      droits: {},
    };
  }

  avecId(id) {
    this.donnees.id = id;
    return this;
  }

  deCreateurDeService(idUtilisateur, idService) {
    this.donnees.estProprietaire = true;
    this.donnees.type = 'createur';
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
    this.donnees.idHomologation = idService;
    return this;
  }

  deContributeurDeService(idUtilisateur, idService) {
    this.donnees.estProprietaire = false;
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
      ? AutorisationBase.NouvelleAutorisationProprietaire(this.donnees)
      : AutorisationBase.NouvelleAutorisationContributeur(this.donnees);
  }
}

const uneAutorisation = () => new ConstructeurAutorisation();

module.exports = { uneAutorisation };
