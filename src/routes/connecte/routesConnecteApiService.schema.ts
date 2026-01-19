import { z } from 'zod';
import { ReferentielV2 } from '../../referentiel.interface.js';

export const schemaPutAutoriteHomologation = () => ({
  nom: z.string().trim().min(1).max(200),
  fonction: z.string().trim().min(1).max(400),
});

export const schemaPutRisqueGeneral = (referentielV2: ReferentielV2) => ({
  niveauGravite: z
    .enum(referentielV2.identifiantsNiveauxGravite())
    .or(z.literal('')),
  niveauVraisemblance: z
    .enum(referentielV2.identifiantsNiveauxVraisemblance())
    .or(z.literal('')),
  commentaire: z.string().max(1000).optional(),
  desactive: z.boolean().optional(),
});
