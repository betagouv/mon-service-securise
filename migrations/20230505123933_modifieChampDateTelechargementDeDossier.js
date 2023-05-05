const pourChaqueLigne = require('./utilitaires/pourChaqueLigne');

const modifieVersDateUnique = (knex, table) => pourChaqueLigne(
  knex(table),
  ({ id, donnees }) => {
    if (!donnees.dossiers) return Promise.resolve();

    donnees.dossiers = donnees.dossiers.map((dos) => {
      let date;

      const telechargementsComplets = Object.keys(dos.datesTelechargements ?? {}).length === 3;
      if (telechargementsComplets) {
        const lesDates = Object.values(dos.datesTelechargements).map((d) => new Date(d));
        const plusRecente = Math.max(...lesDates);
        date = new Date(plusRecente).toISOString();
      }

      dos.dateTelechargement = { date };
      delete dos.datesTelechargements;

      return dos;
    });

    return knex(table).where({ id }).update({ donnees });
  },
);

const supprimeDateUnique = (knex, table) => pourChaqueLigne(
  knex(table),
  ({ id, donnees }) => {
    if (!donnees.dossiers) return Promise.resolve();

    donnees.dossiers = donnees.dossiers.map((dos) => {
      delete dos.dateTelechargement;
      dos.datesTelechargements = {};
      return dos;
    });

    return knex(table).where({ id }).update({ donnees });
  },
);

exports.up = (knex) => Promise.all(
  ['homologations', 'services'].map((table) => modifieVersDateUnique(knex, table))
);

exports.down = (knex) => Promise.all(
  ['homologations', 'services'].map((table) => supprimeDateUnique(knex, table))
);
