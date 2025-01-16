function delieServiceEtSuperviseurs({ serviceSupervision }) {
  return async ({ idService }) => {
    await serviceSupervision.delieServiceEtSuperviseurs(idService);
  };
}

module.exports = { delieServiceEtSuperviseurs };
