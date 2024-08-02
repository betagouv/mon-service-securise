const {
  tousDroitsEnEcriture,
} = require('../../src/modeles/autorisations/gestionDroits');
const Autorisation = require('../../src/modeles/autorisations/autorisation');

class ConstructeurAutorisation {
  constructor() {
    this.donnees = {
      estProprietaire: false,
      id: '',
      idUtilisateur: '',
      idService: '',
      droits: {},
    };
  }

  avecId(id) {
    this.donnees.id = id;
    return this;
  }

  deProprietaire(idUtilisateur, idService) {
    this.donnees.estProprietaire = true;
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
    return this;
  }

  deContributeur(idUtilisateur, idService) {
    this.donnees.estProprietaire = false;
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
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
    return this.donnees.estProprietaire
      ? Autorisation.NouvelleAutorisationProprietaire(this.donnees)
      : Autorisation.NouvelleAutorisationContributeur(this.donnees);
  }
}

const uneAutorisation = () => new ConstructeurAutorisation();

module.exports = { uneAutorisation };
