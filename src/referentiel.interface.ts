import { creeReferentiel } from './referentiel.js';
import { creeReferentielV2 } from './referentielV2.js';

export type Referentiel = ReturnType<typeof creeReferentiel>;
export type ReferentielV2 = ReturnType<typeof creeReferentielV2>;
