import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import {
  schemaMesureSpecifique,
  schemaPlanActionMesure,
} from '../../http/schemas/mesure.schema.js';

export const schemaPostMesureSpecifique = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  description: schemaMesureSpecifique.description(),
  descriptionLongue: schemaMesureSpecifique.descriptionLongue().optional(),
  categorie: schemaMesureSpecifique.categorie(referentiel, referentielV2),
  statut: schemaMesureSpecifique.statut(referentiel, referentielV2),
  modalites: schemaMesureSpecifique.modalites(),
  priorite: schemaPlanActionMesure.priorite(referentielV2).or(z.literal('')),
  echeance: schemaPlanActionMesure.echeance().optional(),
  responsables: schemaPlanActionMesure.responsables().optional(),
});

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
