class CrmBrevo {
  constructor({ adaptateurRechercheEntreprise, adaptateurMail }) {
    if (!adaptateurRechercheEntreprise || !adaptateurMail) {
      throw new Error("Impossible d'instancier le CRM sans adaptateurs");
    }
    this.adaptateurRechercheEntreprise = adaptateurRechercheEntreprise;
    this.adaptateurMail = adaptateurMail;
  }

  async supprimerLienEntrepriseContact(utilisateur) {
    if (!utilisateur)
      throw new Error(
        "Impossible de relier une entreprise et un contact sans avoir l'utilisateur en paramètre."
      );
    const idUtilisateurBrevo =
      await this.adaptateurMail.recupereIdentifiantContact(utilisateur.email);

    const idEntreprise =
      await this.adaptateurMail.recupereEntrepriseDuContact(idUtilisateurBrevo);

    if (idEntreprise) {
      await this.adaptateurMail.supprimeLienEntreContactEtEntreprise(
        idUtilisateurBrevo,
        idEntreprise
      );
    }
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

  metAJourProfilContact(utilisateur) {
    if (!utilisateur)
      throw new Error(
        "Impossible de mettre à jour le contact sans l'utilisateur en paramètre."
      );

    return this.adaptateurMail.metAJourContact(
      utilisateur.email,
      utilisateur.prenom,
      utilisateur.nom,
      utilisateur.telephone
    );
  }

  metAJourNombresContributionsContact(utilisateur, autorisations) {
    if (!utilisateur) {
      throw new Error(
        "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
    if (!autorisations) {
      throw new Error(
        "Impossible d'envoyer à Brevo le nombre de services de l'utilisateur sans avoir les autorisations en paramètre."
      );
    }

    const nombreServicesProprietaire = autorisations.filter(
      (a) => a.estProprietaire
    ).length;
    const nombreServicesContributeur = autorisations.filter(
      (a) => !a.estProprietaire
    ).length;

    return this.adaptateurMail.metAJourDonneesContact(utilisateur.email, {
      sync_mss_nb_services_proprietaire: nombreServicesProprietaire,
      sync_mss_nb_services_contributeur: nombreServicesContributeur,
    });
  }

  async metAJourEstimationNombreServicesContact(utilisateur) {
    if (!utilisateur) {
      throw new Error(
        "Impossible d'envoyer à Brevo l'estimation du nombre de services de l'utilisateur sans avoir l'utilisateur en paramètre."
      );
    }

    if (!utilisateur.estimationNombreServices) return;

    await this.adaptateurMail.metAJourDonneesContact(utilisateur.email, {
      sync_mss_estimation_nb_services_borne_basse:
        utilisateur.estimationNombreServices.borneBasse,
      sync_mss_estimation_nb_services_borne_haute:
        utilisateur.estimationNombreServices.borneHaute,
    });
  }
}

module.exports = CrmBrevo;
