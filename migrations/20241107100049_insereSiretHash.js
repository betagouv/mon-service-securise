const { hacheSha256 } = require('../src/adaptateurs/adaptateurChiffrement');

const hache = (nom) => hacheSha256(nom);

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
