class EvenementMesureModifieeEnMasse {
  constructor({
    utilisateur,
    idMesure,
    statutModifie,
    modalitesModifiees,
    nombreServicesConcernes,
    typeMesure,
  }) {
    this.utilisateur = utilisateur;
    this.idMesure = idMesure;
    this.statutModifie = statutModifie;
    this.modalitesModifiees = modalitesModifiees;
    this.nombreServicesConcernes = nombreServicesConcernes;
    this.type = typeMesure;
  }
}

module.exports = EvenementMesureModifieeEnMasse;
