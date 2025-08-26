import AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import AdaptateurPostgres from './adaptateurPostgres.js';
import * as configurationKnex from '../../knexfile.ts.js';

const fabriqueAdaptateurPersistance = (env) => {
  if (Object.keys(configurationKnex).includes(env))
    return AdaptateurPostgres.nouvelAdaptateur({ env });

  return AdaptateurPersistanceMemoire.nouvelAdaptateur();
};

export default fabriqueAdaptateurPersistance;
