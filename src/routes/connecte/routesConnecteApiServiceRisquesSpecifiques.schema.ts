import { z } from 'zod';
import { schemaRisqueSpecifique } from '../../http/schemas/risque.schema.js';
import { ReferentielV2 } from '../../referentiel.interface.js';

export const schemaPostRisqueSpecifique = (referentielV2: ReferentielV2) => ({
  niveauGravite: schemaRisqueSpecifique.niveauGravite(referentielV2),
  niveauVraisemblance:
    schemaRisqueSpecifique.niveauVraisemblance(referentielV2),
  commentaire: z.string().max(1000),
  description: z.string().max(1000),
  intitule: z.string().trim().min(1).max(400),
  categories: z
    .array(z.enum(referentielV2.identifiantsCategoriesRisque()))
    .min(1),
});

export const schemaPutRisqueSpecifique = (referentielV2: ReferentielV2) => ({
  niveauGravite: schemaRisqueSpecifique.niveauGravite(referentielV2),
  niveauVraisemblance:
    schemaRisqueSpecifique.niveauVraisemblance(referentielV2),
  commentaire: z.string().max(1000),
  description: z.string().max(1000),
  intitule: z.string().trim().min(1).max(400),
  categories: z
    .array(z.enum(referentielV2.identifiantsCategoriesRisque()))
    .min(1),
});
