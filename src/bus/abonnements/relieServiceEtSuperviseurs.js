function relieServiceEtSuperviseurs({ depotDonnees, adaptateurSupervision }) {
  return async ({ service }) => {
    const superviseurs = await depotDonnees.lisSuperviseurs(
      service.siretDeOrganisation()
    );
    await adaptateurSupervision.relieSuperviseursAService(
      service.id,
      superviseurs
    );
  };
}

module.exports = { relieServiceEtSuperviseurs };
