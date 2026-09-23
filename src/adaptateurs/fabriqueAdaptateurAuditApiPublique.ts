import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { knexMSS } from '../bdd/knex.js';
import { AdaptateurAuditApiPubliquePostgres } from './adaptateurAuditApiPubliquePostgres.js';
import { AdaptateurAuditApiPublique } from './adaptateurAuditApiPublique.interface.js';

export const fabriqueAdaptateurAuditApiPublique = (
  env: string,
  adaptateurChiffrement: AdaptateurChiffrement
): AdaptateurAuditApiPublique => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) {
    return new AdaptateurAuditApiPubliquePostgres({
      knex: knexMSS,
      adaptateurChiffrement,
    });
  }

  return {
    trace: async () => {},
  };
};
