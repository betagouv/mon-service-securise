const allerAvant = (delaiAvantImpactCritique) => {
  switch (delaiAvantImpactCritique) {
    case 'immediat':
    case 'uneHeure':
      return 'moinsUneHeure';
    case 'uneSemaine':
    case 'unMois':
      return 'plusUneJournee';
    default:
      return delaiAvantImpactCritique;
  }
};

const retourArriere = (delaiAvantImpactCritique) => {
  switch (delaiAvantImpactCritique) {
    case 'moinsUneHeure':
      return 'immediat';
    case 'plusUneJournee':
      return 'uneSemaine';
    default:
      return delaiAvantImpactCritique;
  }
};

const miseAJourDelaiAvantImpactCritique = (fonctionMiseAJour) => (knex) =>
  knex('homologations').then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees.informationsGenerales)
      .map(({ id, donnees }) => {
        donnees.informationsGenerales.delaiAvantImpactCritique =
          fonctionMiseAJour(
            donnees.informationsGenerales.delaiAvantImpactCritique
          );
        return knex('homologations').where({ id }).update({ donnees });
      });

    return Promise.all(misesAJour);
  });

exports.up = miseAJourDelaiAvantImpactCritique(allerAvant);

exports.down = miseAJourDelaiAvantImpactCritique(retourArriere);
