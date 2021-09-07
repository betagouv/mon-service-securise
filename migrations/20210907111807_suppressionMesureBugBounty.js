exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      donnees.mesures ||= [];
      donnees.mesures = donnees.mesures.filter((m) => m.id !== 'bugBounty');
      return knex('homologations').where({ id }).update({ donnees });
    });

    return Promise.all(misesAJour);
  });

exports.down = () => Promise.resolve();
