import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { knexMSS } from '../bdd/knex.js';
import { AdaptateurAuditAdminOrganisationsPostgres } from './adaptateurAuditAdminOrganisationsPostgres.js';

export const fabriqueAdaptateurAuditAdminOrganisations = (
  env: string,
  adaptateurChiffrement: AdaptateurChiffrement
) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) {
    return new AdaptateurAuditAdminOrganisationsPostgres({
      knex: knexMSS,
      adaptateurChiffrement,
    });
  }

  return {
    trace: async () => {},
  };
};
