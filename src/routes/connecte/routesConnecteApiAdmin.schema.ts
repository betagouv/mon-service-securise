import { z } from 'zod';
import { schemaSiret } from '../../http/schemas/siret.schema.js';

export const schemaPostAdminNomme = z.strictObject({
  emails: z.array(z.email()).min(1).max(50),
  siret: schemaSiret.siret(),
});

export const schemaDeleteAdmin = z.strictObject({
  siret: schemaSiret.siret(),
  idUtilisateur: z.uuid(),
});
