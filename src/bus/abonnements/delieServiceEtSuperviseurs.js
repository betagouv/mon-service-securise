function delieServiceEtSuperviseurs({ adaptateurSupervision }) {
  return async ({ idService }) => {
    await adaptateurSupervision.delieServiceDesSuperviseurs(idService);
  };
}

module.exports = { delieServiceEtSuperviseurs };
