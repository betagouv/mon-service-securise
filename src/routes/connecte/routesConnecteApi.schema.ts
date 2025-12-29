import { z } from 'zod';

const valeur = z.literal;

export const schemaPutUtilisateur = {
  estimationNombreServices: z.xor([
    z.strictObject({ borneBasse: valeur('-1'), borneHaute: valeur('-1') }),
    z.strictObject({ borneBasse: valeur('1'), borneHaute: valeur('10') }),
    z.strictObject({ borneBasse: valeur('10'), borneHaute: valeur('49') }),
    z.strictObject({ borneBasse: valeur('50'), borneHaute: valeur('99') }),
    z.strictObject({ borneBasse: valeur('100'), borneHaute: valeur('100') }),
  ]),
  nom: z.string().trim().min(1).max(200),
  postes: z.array(z.string().trim().min(1).max(100)).min(1).max(8),
  prenom: z.string().trim().min(1).max(200),
  siretEntite: z.string().regex(/^\d{14}$/),
  telephone: z.xor([z.string().regex(/^0\d{9}$/), z.literal('')]),
  transactionnelAccepte: z.stringbool(),
};
