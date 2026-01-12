import { z } from 'zod';
import { schemaCommunPutPostUtilisateur } from '../nonConnecte/routesNonConnecteApi.schema.js';

export const schemaPutUtilisateur = {
  ...schemaCommunPutPostUtilisateur,
  nom: z.string().trim().min(1).max(200),
  prenom: z.string().trim().min(1).max(200),
  cguAcceptees: z.literal(true).optional(),
};
