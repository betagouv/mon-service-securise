exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.dropTable('homologations');
  });
};

exports.down = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.createTable('homologations', (table) => {
      table.uuid('id').primary();
      table.json('donnees');
    });

    await trx.raw('INSERT INTO homologations SELECT * FROM services;');
  });
};
