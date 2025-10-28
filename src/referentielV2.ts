import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';

export const creeReferentielV2 = (): Referentiel => ({
  ...creeReferentiel(),
  version: () => 'v2',
});
