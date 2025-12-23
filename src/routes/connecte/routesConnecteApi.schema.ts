import { z } from 'zod';

export const schemaPutUtilisateur = {
  prenom: z.string().trim().min(1).max(200),
  nom: z.string().trim().min(1).max(200),
  postes: z.array(z.string().trim().min(1).max(100)).min(1).max(8),
};
