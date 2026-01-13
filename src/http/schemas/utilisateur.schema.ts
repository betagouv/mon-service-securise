import { z } from 'zod';

export const schemaUtilisateur = {
  cguAcceptees: () => z.boolean(),
  infolettreAcceptee: () => z.boolean(),
  motDePasse: () => z.string(),
};
