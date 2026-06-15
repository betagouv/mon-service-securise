import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import * as AdaptateurPostgres from './adaptateurPostgres.js';
import * as AdaptateurPersistanceMemoireTestsAccessibilite from './adaptateurPersistanceMemoireTestsAccessibilite.js';

const fabriqueAdaptateurPersistance = (env) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) return AdaptateurPostgres.nouvelAdaptateur({});

  if (env === 'test_accessibilite')
    return AdaptateurPersistanceMemoireTestsAccessibilite.nouvelAdaptateur();

  return AdaptateurPersistanceMemoire.nouvelAdaptateur();
};

export default fabriqueAdaptateurPersistance;
