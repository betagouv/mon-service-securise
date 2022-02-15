const AdaptateurPersistanceMemoire = require('./adaptateurPersistanceMemoire');
const AdaptateurPostgres = require('./adaptateurPostgres');

const configurationKnex = require('../../knexfile');

const fabriqueAdaptateurPersistance = (env) => {
  if (Object.keys(configurationKnex).includes(env)) return AdaptateurPostgres.nouvelAdaptateur(env);

  return AdaptateurPersistanceMemoire.nouvelAdaptateur();
};

module.exports = fabriqueAdaptateurPersistance;
