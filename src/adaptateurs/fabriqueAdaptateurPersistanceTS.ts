import Knex from 'knex';
import configurationKnex from '../../knexfile.js';
import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import { AdaptateurPostgresTS } from './adaptateurPostgresTS.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';

export const fabriqueAdaptateurPersistanceTS = (
  env: string,
  chiffrement: AdaptateurChiffrement
) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) {
    const knex = Knex(configurationKnex);
    return new AdaptateurPostgresTS({ knex, chiffrement });
  }

  return new AdaptateurPersistanceMemoireTS();
};
