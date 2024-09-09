class EvenementNouvelleConnexionUtilisateur {
  constructor({ idUtilisateur, dateDerniereConnexion }) {
    if (!idUtilisateur)
      throw Error("Impossible d'instancier l'événement sans id utilisateur");
    if (!dateDerniereConnexion)
      throw Error(
        "Impossible d'instancier l'événement sans date de dernière connexion"
      );
    if (Number.isNaN(new Date(dateDerniereConnexion).valueOf()))
      throw Error(
        "Impossible d'instancier l'événement sans date de dernière connexion valide"
      );

    this.idUtilisateur = idUtilisateur;
    this.dateDerniereConnexion = dateDerniereConnexion;
  }
}

module.exports = EvenementNouvelleConnexionUtilisateur;
