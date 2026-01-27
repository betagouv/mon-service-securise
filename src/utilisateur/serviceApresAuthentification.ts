const recupereDonneesUtilisateur = async ({
  adaptateurProfilAnssi,
  profilProConnect,
  serviceAnnuaire,
}) => {
  const profilAnssi = await adaptateurProfilAnssi.recupere(
    profilProConnect.email
  );
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
      ...(organisation && { organisation }),
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
      type: 'rendu',
      cible: 'apresAuthentification',
      donnees: {
        ...donneesUtilisateur,
        invite: true,
      },
      utilisateurAConnecter: utilisateur,
    };
  }

  await depotDonnees.rafraichisProfilUtilisateurLocal(utilisateur.id);

  const utilisateurAJour = await depotDonnees.utilisateur(utilisateur.id);
  if (!utilisateurAJour.aLesInformationsAgentConnect()) {
    await depotDonnees.metsAJourUtilisateur(utilisateur.id, {
      nom: profilProConnect.nom,
      prenom: profilProConnect.prenom,
      entite: {
        siret: profilProConnect.siret,
      },
    });
  }

  return {
    type: 'rendu',
    cible: 'apresAuthentification',
    utilisateurAConnecter: utilisateur,
  };
};

export { serviceApresAuthentification };
