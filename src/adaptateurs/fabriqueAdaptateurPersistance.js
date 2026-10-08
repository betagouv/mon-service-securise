import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import * as AdaptateurPostgres from './adaptateurPostgres.js';

const AdaptateurPersistanceMemoireTestsAccessibilite =
  process.env.NODE_ENV === 'test_accessibilite'
    ? await import('./adaptateurPersistanceMemoireTestsAccessibilite.js')
    : undefined;

const fabriqueAdaptateurPersistance = (env) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) return AdaptateurPostgres.nouvelAdaptateur({});

  if (
    env === 'test_accessibilite' &&
    AdaptateurPersistanceMemoireTestsAccessibilite
  )
    return AdaptateurPersistanceMemoireTestsAccessibilite.nouvelAdaptateur();

  return AdaptateurPersistanceMemoire.nouvelAdaptateur();
};

export default fabriqueAdaptateurPersistance;
