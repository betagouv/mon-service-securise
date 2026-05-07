import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

export const up = async (knex) => {
  const chiffrement = fabriqueAdaptateurChiffrement();
  await knex.transaction(async (trx) => {
    const superviseurs = await trx('superviseurs');

    const maj = superviseurs.map(
      async ({
        id_superviseur: id,
        siret_entite_supervisee: siret,
        nom_entite_supervisee: nom,
        departement_entite_supervisee: departement,
      }) => {
        const siretHash = chiffrement.hacheSha256(siret);
        const donneesChiffrees = await chiffrement.chiffre({
          nom,
          departement,
          siret,
        });

        await trx('superviseurs')
          .where({ id_superviseur: id, siret_entite_supervisee: siret })
          .update({ siret_hash: siretHash, donnees: donneesChiffrees });
      }
    );

    await Promise.all(maj);
  });
};

export const down = async (knex) => {
  const chiffrement = fabriqueAdaptateurChiffrement();
  await knex.transaction(async (trx) => {
    const superviseurs = await trx('superviseurs');

    const maj = superviseurs.map(
      async ({
        id_superviseur: id,
        donnees: donneesChiffrees,
        siret_hash: siretHash,
      }) => {
        const donneesEnClair = await chiffrement.dechiffre(donneesChiffrees);

        return trx('superviseurs')
          .where({ id_superviseur: id, siret_hash: siretHash })
          .update({
            siret_hash: null,
            donnees: null,
            siret_entite_supervisee: donneesEnClair.siret,
            nom_entite_supervisee: donneesEnClair.nom,
            departement_entite_supervisee: donneesEnClair.departement,
          });
      }
    );

    await Promise.all(maj);
  });
};
