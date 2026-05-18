import Knex from 'knex';
import configurationKnex from '../../knexfile.js';
import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import { AdaptateurPostgresTS } from './adaptateurPostgresTS.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';

export const fabriqueAdaptateurPersistanceTS = (
  env: string,
  chiffrement: AdaptateurChiffrement
) => {
  if (Object.keys(configurationKnex).includes(env)) {
    const knex = Knex(configurationKnex[env as keyof typeof configurationKnex]);
    return new AdaptateurPostgresTS({ knex, chiffrement });
  }

  return new AdaptateurPersistanceMemoireTS();
};
