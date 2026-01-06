const table = 'parcours_utilisateurs';

export const up = async (knex) => {
  await knex.transaction(async (trx) => {
    const parcoursUtilisateurs = await trx(table);

    const maj = parcoursUtilisateurs.map(({ id, donnees }) => {
      const proprieteADeplacer =
        donnees.explicationNouveauReferentiel?.aVuTableauDeBordDepuisConnexion;

      if (proprieteADeplacer !== undefined) {
        delete donnees.explicationNouveauReferentiel
          ?.aVuTableauDeBordDepuisConnexion;
        donnees.aVuTableauDeBordDepuisConnexion = proprieteADeplacer;
      }

      return trx(table).where({ id }).update({ donnees });
    });

    await Promise.all(maj);
  });
};

export const down = async (knex) => {
  await knex.transaction(async (trx) => {
    const parcoursUtilisateurs = await trx(table);

    const maj = parcoursUtilisateurs.map(({ id, donnees }) => {
      const { aVuTableauDeBordDepuisConnexion, ...autreDonnees } = donnees;

      if (aVuTableauDeBordDepuisConnexion !== undefined) {
        autreDonnees.explicationNouveauReferentiel = {
          ...autreDonnees.explicationNouveauReferentiel,
          aVuTableauDeBordDepuisConnexion,
        };
      }

      return trx(table).where({ id }).update({ donnees: autreDonnees });
    });

    await Promise.all(maj);
  });
};
