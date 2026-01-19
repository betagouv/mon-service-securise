import { z } from 'zod';
import { Permissions } from '../../modeles/autorisations/gestionDroits.js';

export const schemaAutorisation = {
  droits: () =>
    z.strictObject({
      DECRIRE: z.enum(Permissions),
      SECURISER: z.enum(Permissions),
      HOMOLOGUER: z.enum(Permissions),
      RISQUES: z.enum(Permissions),
      CONTACTS: z.enum(Permissions),
      estProprietaire: z.boolean().optional(),
    }),
};
