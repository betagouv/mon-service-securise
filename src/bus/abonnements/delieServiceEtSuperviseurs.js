function delieServiceEtSuperviseurs({ serviceSupervision }) {
  return async ({ idService }) => {
    await serviceSupervision.delieServiceEtSuperviseurs(idService);
  };
}

export { delieServiceEtSuperviseurs };
