import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { schemaMesureGenerale } from '../../http/schemas/mesureGenerale.schema.js';

export const reglesValidationIdMesure = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  idMesure: schemaMesureGenerale.id(referentiel, referentielV2).or(z.uuid()),
  id: z.uuid(),
});
