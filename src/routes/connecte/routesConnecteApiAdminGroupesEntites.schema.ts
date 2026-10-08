import { z } from 'zod';
import { schemaSiret } from '../../http/schemas/siret.schema.js';

export const schemaLibelleGroupeEntites = () => ({
  libelle: z.string().trim().nonempty().max(200),
});

export const schemaIdGroupeEntites = () => ({
  id: z.uuid(),
});

const schemaSirets = () => z.array(schemaSiret.siret()).min(1).max(1000);

export const schemaAssociationGroupeEntites = () => ({
  idsGroupes: z.array(z.uuid()).min(1).max(1000),
  sirets: schemaSirets(),
});

export const schemaDissociationGroupeEntites = () => ({
  sirets: schemaSirets(),
});
