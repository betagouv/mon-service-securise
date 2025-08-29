export const up = (knex) => knex.table('activites_mesure').del();
export const down = () => {};
