import { z } from 'zod';

const unNombreDeMesures = (description: string, example: number) =>
  z.int().nonnegative().meta({ description, example });

export const schemaMesure = z
  .object({
    id: z.string().meta({
      description:
        "Identifiant de la mesure : celui du référentiel ANSSI, ou un UUID pour une mesure ajoutée par l'équipe.",
      example: 'deconnexionAutomatique',
    }),
    origine: z.enum(['referentielV1', 'referentielV2', 'utilisateur']).meta({
      description:
        "`referentielV1` ou `referentielV2` pour une mesure du référentiel ANSSI, selon la version du référentiel suivie par le service ; `utilisateur` pour une mesure ajoutée par l'équipe.",
    }),
    intitule: z.string().meta({
      description: 'Intitulé de la mesure.',
      example:
        'Mettre en place une déconnexion automatique des sessions inactives',
    }),
    categorie: z
      .enum(['gouvernance', 'protection', 'defense', 'resilience'])
      .meta({ description: 'Catégorie de la mesure.' }),
    indispensable: z.boolean().meta({
      description: 'Indique si la mesure est indispensable pour ce service.',
    }),
    statut: z.enum(['fait', 'enCours', 'nonFait', 'aLancer']).nullable().meta({
      description:
        "État d'application de la mesure : `fait` (Faite), `enCours` (Partielle), `nonFait` (Non prise en compte), `aLancer` (À lancer). `null` si la mesure n'a jamais été renseignée.",
    }),
    echeance: z.iso.date().nullable().meta({
      description: "Date d'échéance de la mesure, `null` si non renseignée.",
      example: '2026-12-31',
    }),
    modalites: z.string().nullable().meta({
      description:
        'Modalités de mise en œuvre de la mesure, `null` si non renseignées.',
      example: "Délai porté à 30 minutes, reste à traiter l'espace agent",
    }),
  })
  .meta({ id: 'Mesure' });

export const schemaReponseMesures = z
  .object({
    synthese: z
      .object({
        fait: unNombreDeMesures('Nombre de mesures faites.', 18),
        enCours: unNombreDeMesures('Nombre de mesures partielles.', 5),
        nonFait: unNombreDeMesures(
          'Nombre de mesures non prises en compte.',
          2
        ),
        aLancer: unNombreDeMesures('Nombre de mesures à lancer.', 7),
        nonRenseigne: unNombreDeMesures(
          'Nombre de mesures dont le statut est `null`.',
          9
        ),
      })
      .meta({ description: 'Nombre de mesures par statut.' }),
    donnees: z.array(schemaMesure),
  })
  .meta({ id: 'ReponseMesures' });

export type MesureApiPublique = z.infer<typeof schemaMesure>;
export type ReponseMesuresApiPublique = z.infer<typeof schemaReponseMesures>;
