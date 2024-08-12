const enIso = (chaineDate) => new Date(chaineDate).toISOString();

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const services = await trx('services');

    const maj = services.map(({ id, donnees }) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const generale of donnees.mesuresGenerales || []) {
        if (generale.echeance) generale.echeance = enIso(generale.echeance);
        else delete generale.echeance;
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const specifique of donnees.mesuresSpecifiques || []) {
        if (specifique.echeance)
          specifique.echeance = enIso(specifique.echeance);
        else delete specifique.echeance;
      }

      return trx('services').where({ id }).update({ donnees });
    });

    await Promise.all(maj);
  });
};

exports.down = () => {};
