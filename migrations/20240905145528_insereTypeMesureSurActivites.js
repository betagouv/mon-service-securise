exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const activites = await trx('activites_mesure');
    const idMesures = [
      ...new Set(activites.map(({ id_mesure: idMesure }) => idMesure)),
    ];
    const maj = idMesures.map((idMesure) =>
      trx('activites_mesure')
        .where({ id_mesure: idMesure })
        .update({
          type_mesure: idMesure.length === 36 ? 'specifique' : 'generale',
        })
    );

    await Promise.all(maj);
  });
};

exports.down = async (knex) => {
  await knex.transaction(async (trx) =>
    trx('activites_mesure').update({ type_mesure: null })
  );
};
