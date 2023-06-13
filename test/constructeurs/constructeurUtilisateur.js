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
      poste: '',
      rssi: '',
      delegueProtectionDonnees: '',
      nomEntitePublique: '',
      departementEntitePublique: '',
      infolettreAcceptee: '',
    };
  }

  avecIdUtilisateur(idUtilisateur) {
    this.donnees.id = idUtilisateur;
    return this;
  }

  construis() {
    return new Utilisateur(this.donnees);
  }
}

module.exports = ConstructeurUtilisateur;
