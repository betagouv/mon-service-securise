const Utilisateur = require('../../src/modeles/utilisateur');

class ConstructeurUtilisateur {
  constructor(adaptateurJWT = {}) {
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
    this.adaptateurJWT = adaptateurJWT;
  }

  avecCguAcceptees() {
    this.donnees.cguAcceptees = true;
    return this;
  }

  avecId(idUtilisateur) {
    this.donnees.id = idUtilisateur;
    return this;
  }

  avecEmail(email) {
    this.donnees.email = email;
    return this;
  }

  avecPrenomNom(prenom, nom) {
    this.donnees.prenom = prenom;
    this.donnees.nom = nom;
    return this;
  }

  construis() {
    return new Utilisateur(this.donnees, { adaptateurJWT: this.adaptateurJWT });
  }
}

const unUtilisateur = (adaptateurJWT) =>
  new ConstructeurUtilisateur(adaptateurJWT);

module.exports = { ConstructeurUtilisateur, unUtilisateur };
