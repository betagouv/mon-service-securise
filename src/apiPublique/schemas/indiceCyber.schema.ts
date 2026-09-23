import { z } from 'zod';

const uneNote = (description: string, example: number) =>
  z.number().nonnegative().meta({ description, example });

export const schemaReponseIndiceCyber = z
  .object({
    noteMax: z.number().positive().meta({
      description: "Note maximale de l'indice cyber.",
      example: 5,
    }),
    total: uneNote('Indice cyber du service, arrondi à une décimale.', 3.4),
    parCategorie: z
      .object({
        gouvernance: uneNote('Note de la catégorie Gouvernance.', 4.2),
        protection: uneNote('Note de la catégorie Protection.', 3.1),
        defense: uneNote('Note de la catégorie Défense.', 2.8),
        resilience: uneNote('Note de la catégorie Résilience.', 3.6),
      })
      .meta({ description: 'Détail de la note par catégorie de mesures.' }),
  })
  .meta({ id: 'ReponseIndiceCyber' });

export type IndiceCyberApiPublique = z.infer<typeof schemaReponseIndiceCyber>;
