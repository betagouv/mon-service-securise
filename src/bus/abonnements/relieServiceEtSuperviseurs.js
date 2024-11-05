function relieServiceEtSuperviseurs({ depotDonnees, adaptateurSupervision }) {
  return async ({ service }) => {
    const superviseurs = await depotDonnees.lisSuperviseurs(
      service.siretDeOrganisation()
    );

    if (!superviseurs.length) return;

    await adaptateurSupervision.relieSuperviseursAService(
      service,
      superviseurs
    );
  };
}

module.exports = { relieServiceEtSuperviseurs };
