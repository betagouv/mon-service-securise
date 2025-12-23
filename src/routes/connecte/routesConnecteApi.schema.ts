import { z } from 'zod';

export const schemaPutUtilisateur = {
  prenom: z.string().trim().min(1).max(200),
  nom: z.string().trim().min(1).max(200),
};
