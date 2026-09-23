import { z } from 'zod';

export const schemaService = z
  .object({
    id: z.uuid().meta({
      description: 'Identifiant du service.',
    }),
    nom: z.string().meta({
      description: 'Nom du service numérique.',
      example: "Téléservice de demande d'aide",
    }),
    organisationResponsable: z
      .object({
        nom: z.string().nullable().meta({
          description: "`null` si le nom de l'entité n'est pas renseignée.",
          example: 'ANSSI',
        }),
        siret: z.string().nullable().meta({
          description: "`null` si le SIRET de l'entité n'est pas renseigné.",
          example: '21690123400015',
        }),
      })
      .meta({ description: "L'entité qui porte le service." }),
    nombreContributeurs: z.int().nonnegative().meta({
      description: 'Nombre de personnes ayant accès au service.',
      example: 4,
    }),
    besoinsSecurite: z
      .enum(['basiques', 'moderes', 'avances'])
      .optional()
      .meta({
        description: 'Besoins de sécurité du service.',
      }),
  })
  .meta({ id: 'Service' });

export const schemaReponseServices = z
  .object({ donnees: z.array(schemaService) })
  .meta({ id: 'ReponseServices' });

export type ServiceApiPublique = z.infer<typeof schemaService>;
