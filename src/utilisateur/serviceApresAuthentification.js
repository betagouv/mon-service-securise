const serviceApresAuthentification = async ({
  adaptateurProfilAnssi,
  serviceAnnuaire,
  profilProConnect,
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

  return {
    type: 'redirection',
    cible: '/creation-compte',
    donnees,
  };
};

module.exports = { serviceApresAuthentification };
