import { z } from 'zod';

export const schemaUtilisateur = {
  motDePasse: () => z.string(),
};
