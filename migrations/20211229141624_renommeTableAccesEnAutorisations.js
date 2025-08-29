export const up = (knex) => knex.schema.renameTable('acces', 'autorisations');
export const down = (knex) => knex.schema.renameTable('autorisations', 'acces');
