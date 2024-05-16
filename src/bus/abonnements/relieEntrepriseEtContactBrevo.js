function relieEntrepriseEtContactBrevo({
  adaptateurRechercheEntreprise,
  adaptateurMail,
}) {
  return async ({ utilisateur }) => {
    if (!utilisateur)
      throw new Error(
        "Impossible de relier une entreprise et un contact sans avoir l'utilisateur en paramètre."
      );

    if (!utilisateur.entite.siret) return;

    const idUtilisateurBrevo = await adaptateurMail.recupereIdentifiantContact(
      utilisateur.email
    );

    let idEntrepriseBrevo = await adaptateurMail.recupereEntreprise(
      utilisateur.entite.siret
    );

    if (!idEntrepriseBrevo) {
      const { entite } = utilisateur;
      const entiteResponsable =
        await adaptateurRechercheEntreprise.recupereDetailsOrganisation(
          entite.siret
        );
      idEntrepriseBrevo = await adaptateurMail.creeEntreprise(
        entite.siret,
        entite.nom,
        entiteResponsable.natureJuridique
      );
    }

    await adaptateurMail.relieContactAEntreprise(
      idUtilisateurBrevo,
      idEntrepriseBrevo
    );
  };
}

module.exports = { relieEntrepriseEtContactBrevo };
