const Utilisateur = require('../../src/modeles/utilisateur');

class ConstructeurUtilisateur {
  constructor() {
    this.donnees = {
      dateCreation: '',
      id: '999',
      idResetMotDePasse: '',
      prenom: '',
      nom: '',
      email: 'jean.dujardin@beta.gouv.com',
      telephone: '',
      cguAcceptees: '',
      postes: [],
      entite: {
        nom: '',
        departement: '',
      },
      infolettreAcceptee: '',
      transactionnelAccepte: '',
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

  avecPostes(postes) {
    this.donnees.postes = postes;
    return this;
  }

  avecNomEntite(nomEntite) {
    this.donnees.entite.nom = nomEntite;
    return this;
  }

  quiSAppelle(prenomNom) {
    const [prenom, nom] = prenomNom.split(' ');
    this.donnees.prenom = prenom;
    this.donnees.nom = nom;
    return this;
  }

  quiAccepteInfolettre() {
    this.donnees.infolettreAcceptee = true;
    return this;
  }

  quiRefuseInfolettre() {
    this.donnees.infolettreAcceptee = false;
    return this;
  }

  quiAccepteEmailsTransactionnels() {
    this.donnees.transactionnelAccepte = true;
    return this;
  }

  quiRefuseEmailsTransactionnels() {
    this.donnees.transactionnelAccepte = false;
    return this;
  }

  quiAccepteCGU() {
    this.donnees.cguAcceptees = true;
    return this;
  }

  quiDependDu(departement) {
    this.donnees.entite.departement = departement;
    return this;
  }

  construis() {
    return new Utilisateur(this.donnees);
  }
}

const unUtilisateur = () => new ConstructeurUtilisateur();

module.exports = { ConstructeurUtilisateur, unUtilisateur };
