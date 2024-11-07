const { hacheSha256 } = require('../src/adaptateurs/adaptateurChiffrement');

const hache = (email) => hacheSha256(email);

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const maj = utilisateurs.map(({ id, donnees }) => {
      const { email, ...autresDonnees } = donnees;
      const emailMinuscule = email.toLowerCase();
      autresDonnees.email = emailMinuscule;
      const emailHash = hache(emailMinuscule);

      return trx('utilisateurs')
        .where({ id })
        .update({ email_hash: emailHash, donnees: autresDonnees });
    });

    await Promise.all(maj);
  });
};

exports.down = async () => {};
