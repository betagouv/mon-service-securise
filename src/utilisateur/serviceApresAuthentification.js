const serviceApresAuthentification = async ({
  adaptateurProfilAnssi,
  serviceAnnuaire,
  profilProConnect,
  depotDonnees,
}) => {
  const profilAnssi = await adaptateurProfilAnssi.recupere();
  let donnees = profilAnssi;

  const utilisateur = await depotDonnees.utilisateurAvecEmail(
    profilProConnect.email
  );

  if (!profilAnssi) {
    let organisation;
    if (profilProConnect.siret) {
      const organisationTrouvee = (
        await serviceAnnuaire.rechercheOrganisations(profilProConnect.siret)
      )[0];
      organisation = organisationTrouvee && {
        ...organisationTrouvee,
        siret: profilProConnect.siret,
      };
    }

    donnees = {
      nom: profilProConnect.nom,
      prenom: profilProConnect.prenom,
      email: profilProConnect.email,
      organisation,
      ...(utilisateur && { invite: true }),
    };
  }

  return {
    type: 'redirection',
    cible: utilisateur ? '/apres-authentification' : '/creation-compte',
    donnees,
    utilisateurAConnecter: utilisateur,
  };
};

module.exports = { serviceApresAuthentification };
