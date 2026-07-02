import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { VersionService } from '../src/modeles/versionService.js';

const chiffrement = fabriqueAdaptateurChiffrement();

export const up = async (knex) => {
  await knex.transaction(async (trx) => {
    const services = await trx('services');

    const ajouteIdentifiantNumerique = services
      .filter(
        ({ version_service: versionService }) =>
          versionService === VersionService.v2
      )
      .map(async ({ id, donnees }) => {
        const enClair = await chiffrement.dechiffre(donnees);

        const longueurRisques = enClair.risquesV2?.risquesSpecifiques?.length;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < longueurRisques; i++) {
          enClair.risquesV2.risquesSpecifiques[i].identifiantNumerique =
            `RS${i + 1}`;
          enClair.prochainIdNumeriqueDeRisqueSpecifiqueV2 = i + 2;
        }

        const chiffrees = await chiffrement.chiffre(enClair);
        await trx('services').where({ id }).update({ donnees: chiffrees });
      });
    await Promise.all(ajouteIdentifiantNumerique);
  });
};

export const down = async (knex) => {
  await knex.transaction(async (trx) => {
    const services = await trx('services');

    const retireIdentifiantNumerique = services
      .filter(
        ({ version_service: versionService }) =>
          versionService === VersionService.v2
      )
      .map(async ({ id, donnees }) => {
        const enClair = await chiffrement.dechiffre(donnees);

        const longueurRisques = enClair.risquesV2?.risquesSpecifiques?.length;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < longueurRisques; i++) {
          delete enClair.risquesV2.risquesSpecifiques[i].identifiantNumerique;
        }
        delete enClair.prochainIdNumeriqueDeRisqueSpecifiqueV2;

        const chiffrees = await chiffrement.chiffre(enClair);
        await trx('services').where({ id }).update({ donnees: chiffrees });
      });
    await Promise.all(retireIdentifiantNumerique);
  });
};
