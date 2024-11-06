function relieServiceEtSuperviseurs({ serviceSupervision }) {
  return async ({ service }) => {
    await serviceSupervision.relieServiceEtSuperviseurs(service);
  };
}

module.exports = { relieServiceEtSuperviseurs };
