import { z } from 'zod';

export const schemaLibelleGroupeServices = () => ({
  libelle: z.string().trim().nonempty().max(200),
});

export const schemaIdGroupeServices = () => ({
  id: z.uuid(),
});

export const schemaAssociationGroupeServices = () => ({
  idsGroupes: z.array(z.uuid()).min(1).max(1000),
  idsServices: z.array(z.uuid()).min(1).max(1000),
});
