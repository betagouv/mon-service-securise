import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import { AdaptateurPostgresTS } from './adaptateurPostgresTS.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { knexMSS } from '../bdd/knex.js';
import * as AdaptateurPersistanceMemoireTestsAccessibiliteTS from './adaptateurPersistanceMemoireTestsAccessibiliteTS.js';

export const fabriqueAdaptateurPersistanceTS = (
  env: string,
  chiffrement: AdaptateurChiffrement
) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) {
    return new AdaptateurPostgresTS({ knex: knexMSS, chiffrement });
  }
  if (env === 'test_accessibilite')
    return AdaptateurPersistanceMemoireTestsAccessibiliteTS.nouvelAdaptateur();

  return new AdaptateurPersistanceMemoireTS();
};
