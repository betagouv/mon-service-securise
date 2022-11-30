const nouveauStatut = (statut) => (statut === 'nonRetenu' ? 'nonFait' : statut);

const supprimeStatut = (knex, table) => knex(table)
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees?.mesuresGenerales || donnees?.mesuresSpecifiques)
      .map(({ id, donnees: { mesuresGenerales, mesuresSpecifiques, ...autresDonnees } }) => {
        const nouvellesMesuresGenerales = mesuresGenerales?.map((mesure) => (
          { ...mesure, statut: nouveauStatut(mesure.statut) }
        ));
        const nouvellesMesuresSpecifiques = mesuresSpecifiques?.map((mesure) => (
          { ...mesure, statut: nouveauStatut(mesure.statut) }
        ));

        return knex(table)
          .where({ id })
          .update({
            donnees: {
              mesuresGenerales: nouvellesMesuresGenerales,
              mesuresSpecifiques: nouvellesMesuresSpecifiques,
              ...autresDonnees,
            },
          });
      });

    return Promise.all(misesAJour);
  });

exports.up = (knex) => Promise.all(
  ['homologations', 'services'].map((table) => supprimeStatut(knex, table))
);

exports.down = () => Promise.resolve();

exports.nouveauStatut = nouveauStatut;
