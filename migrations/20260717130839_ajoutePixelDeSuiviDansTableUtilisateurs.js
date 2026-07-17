import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

const chiffrement = fabriqueAdaptateurChiffrement();

export const up = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const ajoutePixelDeSuivi = utilisateurs.map(async ({ id, donnees }) => {
      const enClair = await chiffrement.dechiffre(donnees);
      enClair.pixelDeSuiviAccepte = true;
      const chiffrees = await chiffrement.chiffre(enClair);
      await trx('utilisateurs').where({ id }).update({ donnees: chiffrees });
    });

    await Promise.all(ajoutePixelDeSuivi);
  });
};

export const down = async (knex) => {
  await knex.transaction(async (trx) => {
    const utilisateurs = await trx('utilisateurs');

    const retirePixelDeSuivi = utilisateurs.map(async ({ id, donnees }) => {
      const enClair = await chiffrement.dechiffre(donnees);
      delete enClair.pixelDeSuiviAccepte;
      const chiffrees = await chiffrement.chiffre(enClair);
      await trx('utilisateurs').where({ id }).update({ donnees: chiffrees });
    });

    await Promise.all(retirePixelDeSuivi);
  });
};
