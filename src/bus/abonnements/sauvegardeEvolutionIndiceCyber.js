function sauvegardeEvolutionIndiceCyber({ depotDonnees }) {
  return async ({ service }) => {
    if (!service)
      throw new Error(
        "Impossible de sauvegarder l'indice cyber d'un service sans avoir ce service en paramètre."
      );

    const dernierIndiceCyber = await depotDonnees.lisDernierIndiceCyber(
      service.id
    );

    const indiceCyber = service.indiceCyber();
    const indiceCyberPersonnalise = service.indiceCyberPersonnalise();

    const modificationIndiceCyber =
      dernierIndiceCyber &&
      indiceCyber.total.toFixed(2) !==
        dernierIndiceCyber.indiceCyber.total.toFixed(2);
    const modificationIndiceCyberPersonnalise =
      dernierIndiceCyber &&
      indiceCyberPersonnalise.total.toFixed(2) !==
        dernierIndiceCyber.indiceCyberPersonnalise.total.toFixed(2);

    if (
      !dernierIndiceCyber ||
      modificationIndiceCyber ||
      modificationIndiceCyberPersonnalise
    )
      await depotDonnees.sauvegardeNouvelIndiceCyber({
        idService: service.id,
        indiceCyber,
        indiceCyberPersonnalise,
        mesuresParStatut: service.statistiquesMesures().totauxParCategorie(),
      });
  };
}

module.exports = { sauvegardeEvolutionIndiceCyber };
