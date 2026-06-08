import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import * as AdaptateurPostgres from './adaptateurPostgres.js';

const fabriqueAdaptateurPersistance = (env) => {
  const veutDuPostgres = ['production', 'development'].includes(env);
  if (veutDuPostgres) return AdaptateurPostgres.nouvelAdaptateur({});

  return AdaptateurPersistanceMemoire.nouvelAdaptateur();
};

export default fabriqueAdaptateurPersistance;
