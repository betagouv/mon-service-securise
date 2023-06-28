const { avecPMapPourChaqueElement } = require('../src/utilitaires/pMap');

const archiveDossiers = (dossiers) => {
  const candidats = dossiers
    .filter((d) => d.finalise)
    .filter((d) => !d.archive);
  const parOrdreDechronologique = candidats.sort(
    (a, b) =>
      new Date(b.decision?.dateHomologation) -
      new Date(a.decision?.dateHomologation)
  );
  const [, ...lesPlusVieux] = parOrdreDechronologique;
  lesPlusVieux.forEach((d) => (d.archive = true));
};

const archiveDossiersDansTable = async (knex, table) => {
  const lignes = await knex(table);
  const donneesAJour = Promise.all(
    lignes
      .filter(({ donnees }) => !!donnees.dossiers)
      .map(({ id, donnees }) => {
        archiveDossiers(donnees.dossiers);
        return { id, donnees };
      })
  );
  return avecPMapPourChaqueElement(donneesAJour, ({ id, donnees }) =>
    knex(table).where({ id }).update({ donnees })
  );
};

const supprimeArchivageDansTable = async (knex, table) => {
  const lignes = await knex(table);
  const donneesAJour = Promise.all(
    lignes
      .filter(({ donnees }) => !!donnees.dossiers)
      .map(({ id, donnees }) => {
        donnees.dossiers.forEach((d) => {
          d.archive = undefined;
        });
        return { id, donnees };
      })
  );
  return avecPMapPourChaqueElement(donneesAJour, ({ id, donnees }) =>
    knex(table).where({ id }).update({ donnees })
  );
};

exports.up = async (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      archiveDossiersDansTable(knex, table)
    )
  );

exports.down = async (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      supprimeArchivageDansTable(knex, table)
    )
  );

exports.archiveDossiers = archiveDossiers;
