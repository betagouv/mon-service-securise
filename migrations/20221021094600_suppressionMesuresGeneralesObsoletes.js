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

exports.up = (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      donnees.mesuresGenerales ||= [];
      donnees.mesuresGenerales = donnees.mesuresGenerales
        .filter((m) => !IDS_MESURES_OBSOLETES.includes(m.id));
      return knex('homologations').where({ id }).update({ donnees });
    });

    return Promise.all(misesAJour);
  });

exports.down = () => Promise.resolve();
