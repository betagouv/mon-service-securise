export const up = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.renameColumn('siret_supervise', 'siret_entite_supervisee');
    table.text('nom_entite_supervisee');
    table.text('departement_entite_supervisee');
  });

export const down = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.dropColumn('nom_entite_supervisee');
    table.dropColumn('departement_entite_supervisee');
    table.renameColumn('siret_entite_supervisee', 'siret_supervise');
  });
