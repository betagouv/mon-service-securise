import { z } from 'zod';
import donneesReferentiel from '../../../donneesReferentiel.js';

export const schemaVisiteGuidee = {
  idEtape: () => z.enum(Object.keys(donneesReferentiel.etapesVisiteGuidee)),
};
