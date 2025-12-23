import { z } from 'zod';

export const schemaPutUtilisateur = {
  nom: z.string().trim().min(1).max(200),
  postes: z.array(z.string().trim().min(1).max(100)).min(1).max(8),
  prenom: z.string().trim().min(1).max(200),
  siretEntite: z.string().regex(/^\d{14}$/),
  telephone: z.string().regex(/^0\d{9}$/),
};
