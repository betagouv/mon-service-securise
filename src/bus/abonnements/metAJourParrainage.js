function metAJourParrainage({ depotDonnees }) {
  return async ({ utilisateur }) => {
    const parrainage = await depotDonnees.parrainagePour(utilisateur.id);
    if (
      !parrainage ||
      parrainage.compteFilleulEstFinalise() ||
      utilisateur.estUnInvite()
    ) {
      return;
    }
    parrainage.confirmeFinalisationCompteFilleul();
    await depotDonnees.metsAJourParrainage(parrainage);
  };
}

module.exports = { metAJourParrainage };
