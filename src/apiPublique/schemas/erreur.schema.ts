import { z } from 'zod';

export const schemaErreur = z
  .object({
    erreur: z.string().meta({
      description: "Code de l'erreur, stable et destiné aux programmes.",
      example: 'CLE_API_INVALIDE',
    }),
  })
  .meta({ id: 'Erreur' });
