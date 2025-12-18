import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';

export const reglesValidationIdMesure = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  idMesure: z
    .enum([
      ...Object.keys(referentiel.mesures()),
      ...Object.keys(referentielV2.mesures()),
    ])
    .or(z.uuid()),
  id: z.uuid(),
});
