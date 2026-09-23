import { z } from 'zod';

export const schemaHomologation = z.object({
  statut: z.enum(['activee', 'bientotExpiree', 'expiree']).meta({
    description:
      "Statut de l'homologation, calculé à la date de l'appel : `activee` (en cours de validité), `bientotExpiree` (valide, mais échéance proche) ou `expiree` (échéance dépassée).",
  }),
  dateDecision: z.iso.date().meta({
    description: "Date de la décision d'homologation.",
    example: '2026-03-12',
  }),
  dureeValidite: z.enum(['sixMois', 'unAn', 'deuxAns', 'troisAns']).meta({
    description: "Durée de validité de l'homologation.",
    example: 'unAn',
  }),
  dateEcheance: z.iso.date().meta({
    description: "Date à laquelle l'homologation arrive à échéance.",
    example: '2027-03-12',
  }),
});

export const schemaReponseHomologation = z
  .object({
    enCours: schemaHomologation.nullable().meta({
      description:
        "La dernière homologation active du service, `null` si le service n'en a aucune.",
    }),
  })
  .meta({ id: 'ReponseHomologation' });

export type HomologationApiPublique = z.infer<typeof schemaHomologation>;
export type ReponseHomologationApiPublique = z.infer<
  typeof schemaReponseHomologation
>;
