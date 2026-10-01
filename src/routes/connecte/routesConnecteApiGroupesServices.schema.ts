import { z } from 'zod';

export const schemaLibelleGroupeServices = () => ({
  libelle: z.string().trim().nonempty().max(200),
});

export const schemaIdGroupeServices = () => ({
  id: z.uuid(),
});
