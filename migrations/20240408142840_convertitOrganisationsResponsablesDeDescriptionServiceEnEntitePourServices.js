exports.up = async (knex) => {
  const services = await knex('services');
  const misesAJour = services.map(({ id, donnees }) => {
    const nomOrganisation =
      donnees.descriptionService?.organisationsResponsables?.length > 0
        ? donnees.descriptionService.organisationsResponsables[0]
        : '';
    donnees.descriptionService.organisationResponsable = {
      nom: nomOrganisation,
      siret: '',
      departement: '',
    };
    delete donnees.descriptionService.organisationsResponsables;
    return knex('services').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};

exports.down = async (knex) => {
  const services = await knex('services');
  const misesAJour = services.map(({ id, donnees }) => {
    donnees.descriptionService.organisationsResponsables = [
      donnees.descriptionService.organisationResponsable.nom,
    ];
    delete donnees.descriptionService.organisationResponsable;
    return knex('services').where({ id }).update({ donnees });
  });
  await Promise.all(misesAJour);
};
