exports.up = (knex) => knex.schema.renameTable('acces', 'autorisations');

exports.down = (knex) => knex.schema.renameTable('autorisations', 'acces');
