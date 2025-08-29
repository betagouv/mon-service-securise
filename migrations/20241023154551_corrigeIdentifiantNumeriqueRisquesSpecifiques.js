export const up = (knex) =>
  knex('services').then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      if (donnees.risquesSpecifiques) {
        for (let i = 0; i < donnees.risquesSpecifiques.length; i += 1) {
          donnees.risquesSpecifiques[i].identifiantNumerique = `RS${i + 1}`;
        }
      }
      donnees.prochainIdNumeriqueDeRisqueSpecifique = donnees.risquesSpecifiques
        ? donnees.risquesSpecifiques.length + 1
        : 1;
      return knex('services').where({ id }).update({ donnees });
    });
    return Promise.all(misesAJour);
  });

export const down = (knex) =>
  knex('services').then((lignes) => {
    const misesAJour = lignes.map(({ id, donnees }) => {
      donnees.risquesSpecifiques = donnees.risquesSpecifiques?.map((m) => {
        delete m.identifiantNumerique;
        return m;
      });
      delete donnees.prochainIdNumeriqueDeRisqueSpecifique;
      return knex('services').where({ id }).update({
        donnees,
      });
    });
    return Promise.all(misesAJour);
  });
