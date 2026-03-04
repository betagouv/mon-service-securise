import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

export const up = async (knex) => {
  const chiffrement = fabriqueAdaptateurChiffrement();

  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const maj = utilisateurs.map(async ({ id, donnees: donneesChiffrees }) => {
      const donneesEnClair = await chiffrement.dechiffre(donneesChiffrees);
      delete donneesEnClair.motDePasse;
      const donneesPropre = await chiffrement.chiffre(donneesEnClair);

      return trx('utilisateurs')
        .where({ id })
        .update({ donnees: donneesPropre });
    });

    await Promise.all(maj);
  });
};

export const down = async () => {};
