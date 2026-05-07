export const up = (knex) =>
  knex.schema.alterTable('superviseurs', (table) => {
    table.dropPrimary();
    table.dropColumns(
      'nom_entite_supervisee',
      'siret_entite_supervisee',
      'departement_entite_supervisee'
    );
    table.primary(['siret_hash', 'id_superviseur']);
    table.string('siret_hash').notNullable().alter();
  });

export const down = () => {
  // Il faudrait recréer les colonnes et déchiffrer les données pour remplir
  // la table, on choisit de ne pas gérer ce down
};
