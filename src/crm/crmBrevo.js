class CrmBrevo {
  constructor({ adaptateurRechercheEntreprise, adaptateurMail }) {
    if (!adaptateurRechercheEntreprise || !adaptateurMail) {
      throw new Error("Impossible d'instancier le CRM sans adaptateurs");
    }
    this.adaptateurRechercheEntreprise = adaptateurRechercheEntreprise;
    this.adaptateurMail = adaptateurMail;
  }

  async creerLienEntrepriseContact(utilisateur) {
    if (!utilisateur)
      throw new Error(
        "Impossible de relier une entreprise et un contact sans avoir l'utilisateur en paramètre."
      );

    if (!utilisateur.entite.siret) return;

    const idUtilisateurBrevo =
      await this.adaptateurMail.recupereIdentifiantContact(utilisateur.email);

    let idEntrepriseBrevo = await this.adaptateurMail.recupereEntreprise(
      utilisateur.entite.siret
    );

    if (!idEntrepriseBrevo) {
      const { entite } = utilisateur;
      const entiteResponsable =
        await this.adaptateurRechercheEntreprise.recupereDetailsOrganisation(
          entite.siret
        );
      idEntrepriseBrevo = await this.adaptateurMail.creeEntreprise(
        entite.siret,
        entite.nom,
        entiteResponsable.natureJuridique
      );
    }

    await this.adaptateurMail.relieContactAEntreprise(
      idUtilisateurBrevo,
      idEntrepriseBrevo
    );
  }
}

module.exports = CrmBrevo;
