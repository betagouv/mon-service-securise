import * as adaptateurPostgres from './adaptateurPostgres.js';

export type AdaptateurPersistance = ReturnType<
  typeof adaptateurPostgres.nouvelAdaptateur
>;
