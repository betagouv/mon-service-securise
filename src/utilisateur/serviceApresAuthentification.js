const recupereDonneesUtilisateur = async ({
  adaptateurProfilAnssi,
  profilProConnect,
  serviceAnnuaire,
}) => {
  const profilAnssi = await adaptateurProfilAnssi.recupere();
  let donnees = profilAnssi;
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
    };
  }
  return donnees;
};

const serviceApresAuthentification = async ({
  adaptateurProfilAnssi,
  serviceAnnuaire,
  profilProConnect,
  depotDonnees,
}) => {
  const utilisateur = await depotDonnees.utilisateurAvecEmail(
    profilProConnect.email
  );

  if (!utilisateur) {
    return {
      type: 'redirection',
      cible: '/creation-compte',
      donnees: await recupereDonneesUtilisateur({
        adaptateurProfilAnssi,
        profilProConnect,
        serviceAnnuaire,
      }),
    };
  }

  if (utilisateur.estUnInvite()) {
    const donneesUtilisateur = await recupereDonneesUtilisateur({
      adaptateurProfilAnssi,
      profilProConnect,
      serviceAnnuaire,
    });
    return {
      type: 'redirection',
      cible: '/apres-authentification',
      donnees: {
        ...donneesUtilisateur,
        invite: true,
      },
      utilisateurAConnecter: utilisateur,
    };
  }

  await depotDonnees.rafraichisProfilUtilisateurLocal(utilisateur.id);

  return {
    type: 'redirection',
    cible: '/apres-authentification',
    utilisateurAConnecter: utilisateur,
  };
};

module.exports = { serviceApresAuthentification };
