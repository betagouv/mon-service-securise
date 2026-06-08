import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import { AdaptateurPostgresTS } from './adaptateurPostgresTS.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { knexMSS } from '../bdd/knex.js';

export const fabriqueAdaptateurPersistanceTS = (
  env: string,
  chiffrement: AdaptateurChiffrement
) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) {
    return new AdaptateurPostgresTS({ knex: knexMSS, chiffrement });
  }

  return new AdaptateurPersistanceMemoireTS();
};
