import { z } from 'zod';

export const schemaPutAutoriteHomologation = () => ({
  nom: z.string().trim().min(1).max(200),
  fonction: z.string().trim().min(1).max(400),
});
