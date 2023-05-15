const IDS_MESURES_OBSOLETES = [
  'accesSecurise',
  'affichageDerniereConnexion',
  'formaliserModalitesSecurite',
  'franceConnect',
  'interdictionParageVente',
  'modalitesSuivi',
  'parefeu',
  'politiqueInformation',
  'scanIP',
  'sensibilisationRisques',
];

const supprimeMesuresObsoletesDansTable = (knex, table) =>
  knex(table).then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      donnees.mesuresGenerales ||= [];
      donnees.mesuresGenerales = donnees.mesuresGenerales.filter(
        (m) => !IDS_MESURES_OBSOLETES.includes(m.id)
      );
      return knex(table).where({ id }).update({ donnees });
    });

    return Promise.all(misesAJour);
  });

exports.up = (knex) =>
  Promise.all(
    ['homologations', 'services'].map((table) =>
      supprimeMesuresObsoletesDansTable(knex, table)
    )
  );

exports.down = () => Promise.resolve();
