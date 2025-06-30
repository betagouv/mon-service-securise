class EvenementMesureModifieeEnMasse {
  constructor({
    utilisateur,
    idMesure,
    statutModifie,
    modalitesModifiees,
    nombreServicesConcernes,
  }) {
    this.utilisateur = utilisateur;
    this.idMesure = idMesure;
    this.statutModifie = statutModifie;
    this.modalitesModifiees = modalitesModifiees;
    this.nombreServicesConcernes = nombreServicesConcernes;
    this.type = 'generale';
  }
}

module.exports = EvenementMesureModifieeEnMasse;
