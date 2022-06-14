const metsAJourStatutMesure = (changeStatut) => (mesure) => {
  mesure.statut = changeStatut(mesure.statut);
  return mesure;
};

const changementMesures = (changeStatut) => (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees?.mesuresGenerales || donnees?.mesuresSpecifiques)
      .map(({ id, donnees: { mesuresGenerales, mesuresSpecifiques, ...autresDonnees } }) => knex('homologations')
        .where({ id })
        .update({ donnees: {
          mesuresGenerales: mesuresGenerales?.map(metsAJourStatutMesure(changeStatut)),
          mesuresSpecifiques: mesuresSpecifiques?.map(metsAJourStatutMesure(changeStatut)),
          ...autresDonnees,
        } }));
    return Promise.all(misesAJour);
  });

exports.up = changementMesures((statut) => (statut === 'planifie' ? 'enCours' : statut));

exports.down = changementMesures((statut) => (statut === 'enCours' ? 'planifie' : statut));
