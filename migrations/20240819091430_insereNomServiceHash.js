const { createHash } = require('crypto');

const hache = (chaine) =>
  `v1:${createHash('sha256').update(chaine).digest('hex')}`;

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const services = await trx('services');

    const maj = services.map(({ id, donnees }) => {
      const nomServiceHash = hache(donnees.descriptionService.nomService);

      return trx('services')
        .where({ id })
        .update({ nom_service_hash: nomServiceHash });
    });

    await Promise.all(maj);
  });
};

exports.down = async (knex) => {
  await knex.transaction(async (trx) =>
    trx('services').update({ nom_service_hash: null })
  );
};
