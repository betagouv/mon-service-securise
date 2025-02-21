const { createHash } = require('crypto');

const hache = (chaine) =>
  `v1:${createHash('sha256').update(chaine).digest('hex')}`;

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const services = await trx('services');

    const maj = services.map(({ id, donnees }) => {
      const siret = donnees.descriptionService?.organisationResponsable?.siret;
      const siretHash = siret ? hache(siret) : null;

      return trx('services').where({ id }).update({ siret_hash: siretHash });
    });

    await Promise.all(maj);
  });
};

exports.down = async (knex) => {
  await knex.transaction(async (trx) =>
    trx('services').update({ siret_hash: null })
  );
};
