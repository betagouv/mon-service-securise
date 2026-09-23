import { z } from 'zod';

export const schemaRisque = z
  .object({
    id: z.string().meta({
      description:
        "Identifiant du risque : celui du référentiel ANSSI, ou un UUID pour un risque ajouté par l'équipe.",
      example: 'indisponibiliteService',
    }),
    origine: z.enum(['referentielV1', 'referentielV2', 'utilisateur']).meta({
      description:
        "`referentielV1` ou `referentielV2` pour un risque du référentiel ANSSI, selon la version du référentiel suivie par le service ; `utilisateur` pour un risque ajouté par l'équipe.",
    }),
    intitule: z.string().meta({
      description: 'Intitulé du risque.',
      example: 'Indisponibilité du service',
    }),
    categories: z
      .array(
        z.enum(['disponibilite', 'integrite', 'confidentialite', 'tracabilite'])
      )
      .meta({ description: 'Critères de sécurité concernés par le risque.' }),
    niveauGravite: z
      .enum(['nonConcerne', 'minime', 'significatif', 'grave', 'critique'])
      .nullable()
      .meta({
        description: 'Niveau de gravité du risque, `null` si non évalué.',
      }),
    niveauVraisemblance: z
      .enum([
        'invraisemblable',
        'peuVraisemblable',
        'vraisemblable',
        'tresVraisemblable',
        'quasiCertain',
      ])
      .nullable()
      .meta({
        description: 'Niveau de vraisemblance du risque, `null` si non évalué.',
      }),
    commentaire: z.string().nullable().meta({
      description: 'Commentaire sur le risque, `null` si non renseigné.',
      example: 'Pas de bascule automatique sur le site de secours',
    }),
  })
  .meta({ id: 'Risque' });

export const schemaReponseRisques = z
  .object({ donnees: z.array(schemaRisque) })
  .meta({ id: 'ReponseRisques' });

export type RisqueApiPublique = z.infer<typeof schemaRisque>;
export type ReponseRisquesApiPublique = z.infer<typeof schemaReponseRisques>;
