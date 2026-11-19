import Knex from 'knex';
import { observatoire } from '../adaptateurs/adaptateurEnvironnement.js';

export const knexObservatoire = Knex({
  client: 'pg',
  connection: observatoire().urlServeur(),
  pool: { min: 0, max: observatoire().poolMaximumConnexion() },
});
