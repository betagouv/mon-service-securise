import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import {
  schemaMesureSpecifique,
  schemaPlanActionMesure,
} from '../../http/schemas/mesure.schema.js';
import {
  schemaRisqueGeneral,
  schemaRisqueSpecifiqueV2,
} from '../../http/schemas/risque.schema.js';

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

export const schemaPutMesureSpecifique = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  description: schemaMesureSpecifique.description(),
  descriptionLongue: schemaMesureSpecifique.descriptionLongue().optional(),
  idModele: schemaMesureSpecifique.idModele().optional(),
  categorie: schemaMesureSpecifique.categorie(referentiel, referentielV2),
  statut: schemaMesureSpecifique.statut(referentiel, referentielV2),
  modalites: schemaMesureSpecifique.modalites().optional(),
  priorite: schemaPlanActionMesure
    .priorite(referentielV2)
    .or(z.literal(''))
    .optional(),
  echeance: schemaPlanActionMesure.echeance().or(z.literal('')).optional(),
  responsables: schemaPlanActionMesure.responsables().optional(),
});

export const schemaPutRisqueGeneral = (referentielV2: ReferentielV2) => ({
  niveauGravite: schemaRisqueGeneral.niveauGravite(referentielV2),
  niveauVraisemblance: schemaRisqueGeneral.niveauVraisemblance(referentielV2),
  commentaire: z.string().max(1000).optional(),
  desactive: z.boolean().optional(),
});

export const schemaPutRisqueGeneralV2 = () => ({
  commentaire: z.string().max(1000).optional(),
  desactive: z.boolean().optional(),
});

export const schemaPostRisqueSpecifiqueV2 = (referentielV2: ReferentielV2) => ({
  intitule: z.string().min(1).max(1000),
  description: z.string().max(2000).optional(),
  categories: schemaRisqueSpecifiqueV2.categories(referentielV2),
  vraisemblance: schemaRisqueSpecifiqueV2.niveauVraisemblance(referentielV2),
  vraisemblanceBrute:
    schemaRisqueSpecifiqueV2.niveauVraisemblance(referentielV2),
  gravite: schemaRisqueSpecifiqueV2.niveauGravite(referentielV2),
  graviteBrute: schemaRisqueSpecifiqueV2.niveauGravite(referentielV2),
  commentaire: z.string().max(1000).optional(),
});
