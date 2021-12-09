function miseAJourInformationsGenerales(modifie) {
  return (knex) => knex('homologations')
    .then((lignes) => {
      const misesAJour = lignes
        .filter(({ donnees }) => donnees.informationsGenerales)
        .map(({ id, donnees: { informationsGenerales, ...autresDonnees } }) => {
          modifie(informationsGenerales);
          return knex('homologations')
            .where({ id })
            .update({ donnees: { informationsGenerales, ...autresDonnees } });
        });
      return Promise.all(misesAJour);
    });
}

function changeNatureServiceEnTypeService(informationsGenerales) {
  informationsGenerales.typeService = informationsGenerales.natureService;
  delete informationsGenerales.natureService;
}

function changeTypeServiceEnNatureService(informationsGenerales) {
  informationsGenerales.natureService = informationsGenerales.typeService;
  delete informationsGenerales.typeService;
}

exports.up = miseAJourInformationsGenerales(changeNatureServiceEnTypeService);

exports.down = miseAJourInformationsGenerales(changeTypeServiceEnNatureService);
