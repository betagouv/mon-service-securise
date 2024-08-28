exports.up = (knex) => knex.table('activites_mesure').del();

exports.down = () => {};
