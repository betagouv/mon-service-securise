const { createHash } = require('crypto');

const hache = (chaine) =>
  `v1:${createHash('sha256').update(chaine).digest('hex')}`;

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const maj = utilisateurs.map(({ id, donnees }) => {
      const { email } = donnees;
      const emailHash = hache(email);

      return trx('utilisateurs')
        .where({ id })
        .update({ email_hash: emailHash });
    });

    await Promise.all(maj);
  });
};

exports.down = async (knex) => {
  await knex.transaction(async (trx) =>
    trx('utilisateurs').update({ email_hash: null })
  );
};
