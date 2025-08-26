import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import * as AdaptateurPostgres from './adaptateurPostgres.js';
import configurationKnex from '../../knexfile.js';

const fabriqueAdaptateurPersistance = (env) => {
  if (Object.keys(configurationKnex).includes(env))
    return AdaptateurPostgres.nouvelAdaptateur({ env });

  return AdaptateurPersistanceMemoire.nouvelAdaptateur();
};

export default fabriqueAdaptateurPersistance;
