import { z } from 'zod';

export const reglesValidationCreationUtilisateur = {
  telephone: z
    .string()
    .regex(/^0\d{9}$/)
    .optional(),
  cguAcceptees: z.literal('true'),
  infolettreAcceptee: z.enum(['true', 'false']),
  transactionnelAccepte: z.enum(['true', 'false']),
  postes: z.array(z.string().max(200)).max(8).min(1),
  estimationNombreServices: z.union([
    z.object({ borneBasse: z.literal('1'), borneHaute: z.literal('10') }),
    z.object({ borneBasse: z.literal('10'), borneHaute: z.literal('49') }),
    z.object({ borneBasse: z.literal('50'), borneHaute: z.literal('99') }),
    z.object({ borneBasse: z.literal('100'), borneHaute: z.literal('100') }),
    z.object({ borneBasse: z.literal('-1'), borneHaute: z.literal('-1') }),
  ]),
  siretEntite: z.string().regex(/^\d{14}$/),
  token: z.string().nonempty(),
};

export const reglesValidationReinitialisationMotDePasse = {
  email: z.email().optional(),
};
