const Utilisateur = require('../../src/modeles/utilisateur');

class ConstructeurUtilisateur {
  constructor() {
    this.donnees = {
      dateCreation: '',
      id: '',
      idResetMotDePasse: '',
      prenom: '',
      nom: '',
      email: 'jean.dujardin@beta.gouv.com',
      telephone: '',
      cguAcceptees: '',
      postes: [],
      nomEntitePublique: '',
      departementEntitePublique: '',
      infolettreAcceptee: '',
    };
  }

  avecId(idUtilisateur) {
    this.donnees.id = idUtilisateur;
    return this;
  }

  avecEmail(email) {
    this.donnees.email = email;
    return this;
  }

  construis() {
    return new Utilisateur(this.donnees);
  }
}

const unUtilisateur = () => new ConstructeurUtilisateur();

module.exports = { ConstructeurUtilisateur, unUtilisateur };
