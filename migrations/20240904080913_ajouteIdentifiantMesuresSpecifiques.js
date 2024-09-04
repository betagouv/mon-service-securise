const adaptateurUUID = require('../src/adaptateurs/adaptateurUUID');

exports.up = (knex) =>
  knex('services').then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      const donneesModifiees = {
        ...donnees,
        mesuresSpecifiques: donnees.mesuresSpecifiques?.map((m) => ({
          ...m,
          ...(!m.id && { id: adaptateurUUID.genereUUID() }),
        })),
      };
      return knex('services').where({ id }).update({
        donnees: donneesModifiees,
      });
    });
    return Promise.all(misesAJour);
  });

exports.down = (knex) =>
  knex('services').then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      donnees.mesuresSpecifiques = donnees.mesuresSpecifiques?.map((m) => {
        delete m.id;
        return m;
      });
      return knex('services').where({ id }).update({
        donnees,
      });
    });
    return Promise.all(misesAJour);
  });
