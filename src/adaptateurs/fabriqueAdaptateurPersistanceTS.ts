import { AdaptateurPersistanceMemoireTS } from './adaptateurPersistanceMemoireTS.js';
import { AdaptateurPostgresTS } from './adaptateurPostgresTS.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { knexMSS } from '../bdd/knex.js';

const AdaptateurPersistanceMemoireTestsAccessibiliteTS =
  process.env.NODE_ENV === 'test_accessibilite'
    ? await import('./adaptateurPersistanceMemoireTestsAccessibiliteTS.js')
    : undefined;

export const fabriqueAdaptateurPersistanceTS = (
  env: string,
  chiffrement: AdaptateurChiffrement
) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) {
    return new AdaptateurPostgresTS({ knex: knexMSS, chiffrement });
  }
  if (
    env === 'test_accessibilite' &&
    AdaptateurPersistanceMemoireTestsAccessibiliteTS
  )
    return AdaptateurPersistanceMemoireTestsAccessibiliteTS.nouvelAdaptateur();

  return new AdaptateurPersistanceMemoireTS();
};
