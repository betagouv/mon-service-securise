exports.up = async (knex) => knex.schema.dropTable('homologations');

exports.down = async (knex) => {
  await knex.schema.createTable('homologations', (table) => {
    table.uuid('id');
    table.primary('id');
    table.json('donnees');
  });
  const services = await knex('services');
  return knex('homologations').insert(services);
};
