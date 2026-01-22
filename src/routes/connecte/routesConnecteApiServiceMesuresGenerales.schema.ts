import { z } from 'zod';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import {
  schemaMesureGenerale,
  schemaPlanActionMesure,
} from '../../http/schemas/mesure.schema.js';

export const schemaPutMesureGenerale = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  statut: schemaMesureGenerale.statut(referentiel, referentielV2),
  modalites: schemaMesureGenerale.modalites().optional(),
  priorite: schemaPlanActionMesure
    .priorite(referentielV2)
    .or(z.literal(''))
    .optional(),
  echeance: schemaPlanActionMesure.echeance().or(z.literal('')).optional(),
  responsables: schemaPlanActionMesure.responsables().optional(),
});
