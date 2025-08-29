import {
  chaineDateFrEnChaineDateISO,
  dateEnFrancais,
} from '../src/utilitaires/date.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

const { chiffre, dechiffre } = fabriqueAdaptateurChiffrement();

const estDateEnFrancais = (chaineDate) =>
  /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(chaineDate);

export const up = async (knex) => {
  await knex.transaction(async (trx) => {
    const televersementServices = await trx('televersement_services');

    const maj = televersementServices.map(
      // eslint-disable-next-line camelcase
      async ({ id_utilisateur, donnees }) => {
        const donneesServicesDechiffrees = await dechiffre(donnees.services);

        const donneesMaj = donneesServicesDechiffrees.map((service) => {
          if (
            !service.dateHomologation ||
            !estDateEnFrancais(service.dateHomologation)
          )
            return service;

          return {
            ...service,
            dateHomologation: chaineDateFrEnChaineDateISO(
              service.dateHomologation
            ),
          };
        });

        const donneesServicesChiffrees = await chiffre(donneesMaj);

        return (
          trx('televersement_services')
            // eslint-disable-next-line camelcase
            .where({ id_utilisateur })
            .update({ donnees: { services: donneesServicesChiffrees } })
        );
      }
    );

    await Promise.all(maj);
  });
};

export const down = async (knex) => {
  await knex.transaction(async (trx) => {
    const televersementServices = await trx('televersement_services');

    const maj = televersementServices.map(
      // eslint-disable-next-line camelcase
      async ({ id_utilisateur, donnees }) => {
        const donneesServicesDechiffrees = await dechiffre(donnees.services);

        const donneesMaj = donneesServicesDechiffrees.map((service) => {
          if (!service.dateHomologation) return service;

          return {
            ...service,
            dateHomologation: dateEnFrancais(service.dateHomologation),
          };
        });

        const donneesServicesChiffrees = await chiffre(donneesMaj);

        return (
          trx('televersement_services')
            // eslint-disable-next-line camelcase
            .where({ id_utilisateur })
            .update({ donnees: { services: donneesServicesChiffrees } })
        );
      }
    );

    await Promise.all(maj);
  });
};
