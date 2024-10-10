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
        siret: '',
      },
      estimationNombreServices: {
        borneBasse: '1',
        borneHaute: '10',
      },
      infolettreAcceptee: '',
      transactionnelAccepte: '',
    };
  }

  quiEstInvite() {
    this.donnees.prenom = '';
    this.donnees.nom = '';
    this.donnees.siret = '';
    this.donnees.estimationNombreServices = {};
    return this;
  }

  sansId() {
    delete this.donnees.id;
    return this;
  }

  avecId(idUtilisateur) {
    this.donnees.id = idUtilisateur;
    return this;
  }

  avecIdResetMotDePasse(idReset) {
    this.donnees.idResetMotDePasse = idReset;
    return this;
  }

  avecEmail(email) {
    this.donnees.email = email;
    return this;
  }

  avecTelephone(telephone) {
    this.donnees.telephone = telephone;
    return this;
  }

  sansEmail() {
    this.donnees.email = null;
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

  avecEstimationNombreServices(borneBasse, borneHaute) {
    this.estimationNombreServices = { borneBasse, borneHaute };
    return this;
  }

  quiTravaillePourUneEntiteAvecSiret(siret) {
    this.donnees.entite.siret = siret;
    return this;
  }

  quiTravaillePour(entite) {
    this.donnees.entite = entite;
    return this;
  }

  quiSAppelle(prenomNom) {
    const [prenom, nom] = prenomNom.split(' ');
    this.donnees.prenom = prenom;
    this.donnees.nom = nom;
    return this;
  }

  quiSEstInscritLe(dateCreation) {
    this.donnees.dateCreation = dateCreation;
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

  quiAEteInvite() {
    this.donnees.cguAcceptees = false;
    return this;
  }

  quiDependDu(departement) {
    this.donnees.entite.departement = departement;
    return this;
  }

  sansEntite() {
    this.donnees.entite = undefined;
    return this;
  }

  construis() {
    return new Utilisateur(this.donnees);
  }
}

const unUtilisateur = () => new ConstructeurUtilisateur();

module.exports = { ConstructeurUtilisateur, unUtilisateur };
