exports.up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      knex(table).then((lignes) => {
        const misesAJour = lignes.map(({ id, donnees }) => {
          delete donnees.descriptionService
            .risqueJuridiqueFinancierReputationnel;
          return knex(table).where({ id }).update({
            donnees,
          });
        });
        return Promise.all(misesAJour);
      })
    )
  );

// Impossible de remettre le champ, car la valeur a été supprimée
exports.down = async () => {};
