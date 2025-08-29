import { createHash } from 'crypto';

const hache = (chaine) =>
  `v1:${createHash('sha256').update(chaine).digest('hex')}`;

export const up = async (knex) => {
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

export const down = async () => {};
