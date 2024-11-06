function modifieLienServiceEtSuperviseurs({ serviceSupervision }) {
  return async ({ service, ancienneDescription }) => {
    if (
      service.siretDeOrganisation() ===
      ancienneDescription.organisationResponsable.siret
    )
      return;
    await serviceSupervision.modifieLienServiceEtSuperviseurs(service);
  };
}

module.exports = { modifieLienServiceEtSuperviseurs };
