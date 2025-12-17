import { z } from 'zod';
import { departements } from '../../../donneesReferentielDepartements.js';

export const reglesValidationCreationUtilisateur = {
  telephone: z
    .string()
    .regex(/^0\d{9}$/)
    .optional()
    .or(z.literal('')),
  cguAcceptees: z.literal(true),
  agentConnect: z.literal(true).optional(),
  infolettreAcceptee: z.boolean(),
  transactionnelAccepte: z.boolean(),
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

export const reglesValidationAuthentificationParLoginMotDePasse = {
  login: z.email(),
  motDePasse: z.string().nonempty(),
};

export const reglesValidationRechercheOrganisations = {
  departement: z.enum(departements.map((d) => d.code)).optional(),
  recherche: z.string().min(3).max(200),
};

export const reglesValidationDesinscriptionInfolettre = {
  event: z.literal('unsubscribe'),
  email: z.email(),
};
