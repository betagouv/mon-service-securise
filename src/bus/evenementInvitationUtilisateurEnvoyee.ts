class EvenementInvitationUtilisateurEnvoyee {
  constructor({ idUtilisateurDestinataire, idUtilisateurEmetteur }) {
    if (!idUtilisateurDestinataire)
      throw Error(
        "Impossible d'instancier l'événement sans id utilisateur destinataire"
      );
    if (!idUtilisateurEmetteur)
      throw Error(
        "Impossible d'instancier l'événement sans id utilisateur emetteur"
      );

    this.idUtilisateurDestinataire = idUtilisateurDestinataire;
    this.idUtilisateurEmetteur = idUtilisateurEmetteur;
  }
}

module.exports = EvenementInvitationUtilisateurEnvoyee;
